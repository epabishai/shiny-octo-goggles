const test = require("node:test");
const assert = require("node:assert/strict");
const { execFile } = require("node:child_process");
const { promisify } = require("node:util");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const { releaseReadiness, runReleaseReadiness } = require("../src/lib/releaseReadiness");

const finding = { line: 4, title: "Concrete bug", detail: "The changed branch returns the wrong result." };
const paused = new Error("Paused for review");

function harness({ files = ["src/a.js", "src/b.js"], review, vote, failures = [] } = {}) {
  const steps = new Map();
  const calls = [];
  const agents = [];
  const events = [];
  const logs = [];
  const phases = [];
  let resumed = false;
  const ctx = {
    args: { baseRef: "origin/main", models: ["model-a", "model-b"] },
    signal: new AbortController().signal,
    phase: (phase) => phases.push(phase),
    log: (message) => logs.push(message),
    step: async (key, producer) => {
      if (!steps.has(key)) steps.set(key, await producer());
      return steps.get(key);
    },
    parallel: (thunks) => Promise.all(thunks.map((thunk) => Promise.resolve().then(thunk).catch(() => null))),
    agent: async (prompt, options) => {
      agents.push({ prompt, ...options });
      events.push(`start:${options.label}`);
      await new Promise((resolve) => setImmediate(resolve));
      events.push(`end:${options.label}`);
      if (options.label.startsWith("review:")) {
        return review ? review(options) : { findings: [finding] };
      }
      return vote ? vote(options) : { agrees: true };
    },
    pause: async (key) => {
      assert.equal(key, "before-summary-v1");
      if (!resumed) throw paused;
    },
  };
  const command = async (name, args, cwd, signal) => {
    calls.push({ name, args, cwd, signal });
    if (name === "git") {
      if (args[0] === "rev-parse") return { exitCode: 0, stdout: "a".repeat(40), stderr: "" };
      if (args[0] === "merge-base") return { exitCode: 0, stdout: "b".repeat(40), stderr: "" };
      return {
        exitCode: 0,
        stdout: args.includes("--name-only") ? files.join("\0") + "\0" : "diff --git a/file b/file\n+changed",
        stderr: "",
      };
    }
    return { exitCode: failures.includes(args.join(" ")) ? 1 : 0, stdout: "check output", stderr: "" };
  };
  const run = () => runReleaseReadiness(ctx, { cwd: "/repository", command });
  return { ctx, calls, agents, events, logs, phases, run, resume: () => { resumed = true; } };
}

test("registers release-readiness with explicit comparison and model inputs", () => {
  assert.equal(releaseReadiness.meta.name, "release-readiness");
  assert.equal(releaseReadiness.run, runReleaseReadiness);
  assert.deepEqual(releaseReadiness.meta.argsSchema.required, ["baseRef", "models"]);
});

test("runs all checks, reviews files in parallel, and pauses before generating a summary", async () => {
  const h = harness();
  await assert.rejects(h.run(), (error) => error === paused);
  assert.deepEqual(h.calls.filter(({ name }) => name === "npm").map(({ args }) => args),
    [["test"], ["run", "lint"], ["audit"]]);
  assert.ok(h.calls.every(({ cwd, signal }) => cwd === "/repository" && signal === h.ctx.signal));
  assert.ok(h.events.indexOf("start:review:1") < h.events.indexOf("end:review:0"));
  assert.ok(h.events.indexOf("start:assess:0:1") < h.events.indexOf("end:assess:0:0"));
  assert.equal(h.phases.includes("Summary"), false);
  assert.equal(JSON.parse(h.logs[0]).findings.length, 2);
  assert.equal("summary" in JSON.parse(h.logs[0]), false);
  const assessments = h.agents.filter(({ label }) => label.startsWith("assess:0:"));
  assert.deepEqual(assessments.map(({ model }) => model), ["model-a", "model-b"]);
  assert.equal(assessments[0].prompt, assessments[1].prompt);

  const callCount = h.calls.length;
  const agentCount = h.agents.length;
  h.resume();
  const result = await h.run();
  assert.equal(h.calls.length, callCount, "resume must not rerun checks or collect a different snapshot");
  assert.equal(h.agents.length, agentCount, "resume must not repeat reviews");
  assert.match(result.summary, /Release needs attention/);
  assert.match(result.summary, /src\/a.js:4/);
  assert.equal(h.phases.at(-1), "Summary");
});

test("reports only findings both models affirm, suppressing disagreements and failed assessments", async () => {
  for (const secondVote of [{ agrees: false }, null, { agrees: "true" }]) {
    const h = harness({
      files: ["src/a.js"],
      vote: ({ model }) => model === "model-a" ? { agrees: true } : secondVote,
    });
    await assert.rejects(h.run(), (error) => error === paused);
    const report = JSON.parse(h.logs[0]);
    assert.deepEqual(report.findings, []);
    assert.equal(report.incompleteAssessments, secondVote?.agrees === false ? 0 : 1);
    h.resume();
    assert.doesNotMatch((await h.run()).summary, /Concrete bug/);
  }
});

test("check failures do not skip later checks, reviews, or the review checkpoint", async () => {
  const h = harness({ failures: ["test", "run lint", "audit"] });
  await assert.rejects(h.run(), (error) => error === paused);
  assert.equal(h.calls.filter(({ name }) => name === "npm").length, 3);
  assert.equal(h.agents.filter(({ label }) => label.startsWith("review:")).length, 2);
  h.resume();
  const result = await h.run();
  assert.match(result.summary, /npm audit: failed/);
  assert.match(result.summary, /Release needs attention/);
});

test("failed and malformed reviews are visible as incomplete coverage, not a clean release", async () => {
  for (const review of [null, { findings: [{ ...finding, line: -1 }] }, { findings: [{}] }]) {
    const h = harness({ files: ["src/a.js"], review: () => review });
    await assert.rejects(h.run(), (error) => error === paused);
    assert.equal(JSON.parse(h.logs[0]).incompleteReviews, 1);
    assert.equal(h.agents.length, 1);
    h.resume();
    assert.match((await h.run()).summary, /Release needs attention/);
  }
});

test("deduplicates identical candidates before independent assessment", async () => {
  const h = harness({ files: ["src/a.js"], review: () => ({ findings: [finding, finding] }) });
  await assert.rejects(h.run(), (error) => error === paused);
  assert.equal(h.agents.length, 3);
  assert.equal(JSON.parse(h.logs[0]).findings.length, 1);
});

test("empty changes and no findings still require review before a clean summary", async () => {
  for (const files of [[], ["src/a.js"]]) {
    const h = harness({ files, review: () => ({ findings: [] }) });
    await assert.rejects(h.run(), (error) => error === paused);
    h.resume();
    const result = await h.run();
    assert.match(result.summary, /Release checks passed; no agreed findings/);
    assert.deepEqual(result.reviewedFiles, files);
    assert.equal(h.agents.length, files.length);
  }
});

test("rejects missing bases and models that are missing, empty, or not distinct", async () => {
  for (const args of [
    {}, { baseRef: "", models: ["a", "b"] }, { baseRef: "main", models: ["a"] },
    { baseRef: "main", models: ["a", "a "] }, { baseRef: "main", models: ["a", " "] },
  ]) {
    const h = harness();
    h.ctx.args = args;
    await assert.rejects(h.run(), /Provide baseRef/);
    assert.equal(h.calls.length, 0);
  }
});

test("snapshots committed, staged, unstaged, and deleted tracked files using literal Git paths", async (t) => {
  const cwd = await fs.mkdtemp(path.join(os.tmpdir(), "release-readiness-"));
  t.after(() => fs.rm(cwd, { recursive: true, force: true }));
  const exec = promisify(execFile);
  const git = (...args) => exec("git", args, { cwd });
  await git("init");
  await git("config", "user.name", "Test");
  await git("config", "user.email", "test@example.invalid");
  const files = ["committed.js", "staged.js", "unstaged.js", "deleted.js", ":(glob)*\n.js"];
  for (const file of files) await fs.writeFile(path.join(cwd, file), "before\n");
  await git("add", ".");
  await git("commit", "-m", "Base");
  const { stdout: baseRef } = await git("rev-parse", "HEAD");
  await fs.writeFile(path.join(cwd, files[0]), "committed\n");
  await git("add", ".");
  await git("commit", "-m", "Change");
  await fs.writeFile(path.join(cwd, files[1]), "staged\n");
  await git("add", ".");
  await fs.writeFile(path.join(cwd, files[2]), "unstaged\n");
  await fs.unlink(path.join(cwd, files[3]));
  await fs.writeFile(path.join(cwd, files[4]), "literal path\n");
  const h = harness({ review: () => ({ findings: [] }) });
  h.ctx.args.baseRef = baseRef.trim();
  const command = async (name, args, directory, signal) => {
    if (name === "npm") return { exitCode: 0, stdout: "", stderr: "" };
    const { stdout, stderr } = await exec(name, args, {
      cwd: directory, signal, env: { ...process.env, GIT_LITERAL_PATHSPECS: "1" },
    });
    return { exitCode: 0, stdout, stderr };
  };
  await assert.rejects(runReleaseReadiness(h.ctx, { cwd, command }), (error) => error === paused);
  assert.deepEqual(JSON.parse(h.logs[0]).reviewedFiles.sort(), files.sort());
  const literalReview = h.agents.find(({ prompt }) => JSON.parse(prompt.slice(prompt.indexOf("\n") + 1)).file === files.find((file) => file.startsWith(":")));
  assert.match(literalReview.prompt, /literal path/);
  assert.doesNotMatch(literalReview.prompt, /unstaged/);
});
