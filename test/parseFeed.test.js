const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const parseFeed = require("../src/legacy/parseFeed");

test("parses fixture entry dates, tags, and summaries", async () => {
  const xml = fs.readFileSync(path.join(__dirname, "..", "fixtures", "feed.xml"), "utf8");
  const entries = await parseFeed(xml);

  assert.equal(entries.length, 17);
  assert.deepEqual(entries[0], {
    title: "GitHub Copilot code review is generally available",
    link: "https://github.blog/changelog/2025-04-04-copilot-code-review-ga/",
    pubDate: "Fri, 04 Apr 2025 16:00:00 +0000",
    summary: "Copilot code review is now generally available, helping teams review pull requests with AI-powered feedback.",
    tags: ["GitHub Copilot", "General availability"],
  });
  assert.deepEqual(entries[1], {
    title: "GitHub Copilot supports server-to-server authentication",
    link: "https://github.blog/changelog/2026-10-27-github-copilot-supports-server-to-server-authentication",
    pubDate: "Tue, 27 Oct 2026 12:00:00 +0000",
    summary: "Read the full entry on the GitHub changelog.",
    tags: ["release", "copilot"],
  });
});

test("preserves markup in a fixture title as literal text", async () => {
  const xml = fs.readFileSync(path.join(__dirname, "..", "fixtures", "feed.xml"), "utf8");
  const fixtureTitle = "<title>GitHub Copilot code review is generally available</title>";
  const literalMarkupTitle = "<title>Community note: &lt;strong&gt;render feed titles as text&lt;/strong&gt;</title>";
  const fixtureWithMarkupTitle = xml.replace(fixtureTitle, literalMarkupTitle);

  assert.notEqual(fixtureWithMarkupTitle, xml);
  const [entry] = await parseFeed(fixtureWithMarkupTitle);

  assert.equal(entry.title, "Community note: <strong>render feed titles as text</strong>");
});
