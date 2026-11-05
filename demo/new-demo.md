# Demo script: Copilot building blocks through the lens of GitHub Universe 2026

About 25 minutes. One persona: a developer shipping polish on Changelog Radar,
working mostly in the GitHub Copilot app. Each vignette maps to a Universe 2026
announcement and an issue labeled `universe-26`.

The story: **goal → plan → parallel work → review → automation → secure → ship.**

## Run of show

| Min | Vignette | Issue | Universe building block | Status (Oct 28, 2026) |
|---|---|---|---|---|
| 0–1 | Open: the developer's day | — | Copilot app | — |
| 1–5 | 1. Turn a goal into coordinated work | #20 | Copilot Projects, Copilot Fusion | Projects: public preview · Fusion: GA |
| 5–8 | 2. Keep the plan with the work | #21 | Issue artifacts, `gh` `--attach` | Public preview |
| 8–11 | 3. Find the PRs that need you | #22 | Repository pull requests, stacked PRs | See recap |
| 11–14 | 4. Merge with confidence | #23 | Code review Max, approvals, Agent Merge | Max: public preview · Approvals: GA |
| 14–17 | 5. Keep work moving | #24 | Copilot Automations | Rolling out |
| 17–19 | 6. Use your tools across Copilot | #25 | Copilot connectors | Preview |
| 19–22 | 7. Act on risk while you build | #26 | Security extension | Public preview |
| 22–24 | 8. Find and fix in any language | #27 | AI Scan, push protection, reachability | Public preview |
| 24–25 | Close | — | — | — |

Existing issues reused: #5 tag filter chips, #9 ETag caching, #10 fixture
allowlist, #11 titles as text, #12 dependency updates, #13 release readiness.

## Pre-flight

- [ ] `npm install && npm test && npm run lint` pass; `npm start` loads offline.
- [ ] Copilot app signed in; Tool permissions set to **Assisted**.
- [ ] Copilot Projects available in the app (public preview).
- [ ] A connector (Microsoft Learn, Slack or Sentry) connected from **Browse**.
- [ ] Security extension installed; code scanning enabled on the repo.
- [ ] AI Scan for repositories enabled; **start a scan before the session**.
- [ ] Pre-stage a PR for #9 with a completed **Max** review in case of time.
- [ ] Org repos: "Allow use of Copilot cloud agent billed to the organization" policy enabled for shared automations.
- [ ] Capture `chips.png` (before/after screenshot) for Vignette 2.
- [ ] Re-check the changelog entries linked below the morning of the demo.

## Open (1 min)

Talking point: one developer, one app, eight building blocks. We'll keep
Changelog Radar's safeguards (text-only rendering, fixture allowlist) intact
the whole time.

## 1. Turn a goal into coordinated work (4 min) — #20

Create a project named **Changelog Radar: Universe polish**. Add the repo and
issues #5 and #9 as context. Choose **Copilot Fusion** and an effort level.

```
Goal: make Changelog Radar Universe-ready. Use issues #5 and #9 in epabishai/fluffy-fortnight. Plan the work, start a session per issue, and bring back pull requests for my review.
```

Talking point: you choose effort (Standard, High, Max), not a model. Fusion
decides whether one model or several work together. Narrate what happens; do
not predict the routing.

## 2. Keep the plan with the work (3 min) — #21

```
Write an implementation plan for #9 covering 200/304 behavior and topic-filtered responses, and attach it to the issue as an artifact.
```

```bash
gh issue artifact list 9 -R epabishai/fluffy-fortnight
gh issue comment 5 -R epabishai/fluffy-fortnight --body "Chips preview" --attach ./chips.png
```

Talking point: the thinking behind the work is versioned on the issue, so the
next teammate or agent starts with context.

## 3. Find the PRs that need you (3 min) — #22

Open the repository pull requests view and scan status. Then ask:

```
Which pull requests in this repo need my attention, and why?
```

Show a small stack (tests, then refactor) reviewed layer by layer.

## 4. Merge with confidence (3 min) — #23

On the #9 PR, request Copilot review at **Max**. Show the approval assessment
in the overview comment. Enable **Watch and fix** (Agent Merge) in the merge
box.

Talking point: Max runs independent review agents across model providers and
reconciles them into one low-noise review. It is slower and uses more AI
credits, so reserve it for risky changes like caching shared responses.
Do not promise specific findings.

## 5. Keep work moving automatically (3 min) — #24

```
Create a shared automation for this repo: when an issue is labeled starter, reproduce it with npm test against fixtures/feed.xml, comment a short plan, and stop. Cap each run's AI credits.
```

Talking point: shared automations belong to the repo, act as Copilot, bill the
repo owner, keep change history, and can propose improvements to themselves.
Mention #13 (release readiness) as a scheduled automation.

## 6. Use your tools across Copilot (2 min) — #25

```
Using the connected docs source, check whether our Deprecations view wording matches how GitHub describes deprecations, and suggest edits.
```

Talking point: connect once, reuse across the app, CLI, VS Code, web and code
review. No MCP server to install or manage.

## 7. Act on security risk while you build (3 min) — #26

Open the Security canvas, then:

```
/security-review
```

```
Extend regression tests for #10 and #11 without weakening the allowlist or textContent rendering.
```

Talking point: your changes and existing code scanning alerts in one place.
Fixes stay in the local working copy until you push. This repo does not plant
vulnerabilities; do not promise findings.

## 8. Find and fix in any language (2 min) — #27

Show the AI Scan you started before the session on the Code scanning page.
Findings sit beside CodeQL alerts and can be assigned to Copilot or added to a
campaign. Close with #12 and reachability: fix the vulnerable functions your
code actually calls first.

## Close (1 min)

Recap the loop: **Projects + Fusion** planned and ran the work, **artifacts**
kept the context, **PR view + Max review** got it merged safely,
**automations + connectors** keep it moving, and the **security extension +
AI Scan** keep it safe.

## Fallbacks

| If… | Then… |
|---|---|
| Projects unavailable | Start sessions directly from the repo for #5 and #9 |
| Max review still running | Switch to the pre-staged reviewed PR |
| AI Scan has no findings | Say so; show the alert list and rescan flow |
| Connector sign-in fails | Show **Browse** and the connected state in another client |

## Sources

- [Universe 2026 recap](https://github.com/events/universe/recap)
- [Copilot app, Universe releases](https://github.blog/changelog/2026-10-28-github-copilot-app-universe-releases)
- [Copilot Fusion](https://github.blog/changelog/2026-10-28-route-and-orchestrate-models-with-github-copilot-fusion)
- [Issue artifacts](https://github.blog/changelog/2026-10-28-issue-artifacts-are-now-in-public-preview)
- [Code review Max and approvals](https://github.blog/changelog/2026-10-28-copilot-code-review-merge-with-confidence-with-max-and-approvals)
- [Agent Merge](https://github.blog/changelog/2026-10-28-agent-merge-watches-and-fixes-pull-requests-in-the-cloud)
- [Shared Copilot Automations](https://github.blog/changelog/2026-10-28-build-shared-workflows-for-your-team-with-copilot-automations)
- [Automations triggers, tools and cost controls](https://github.blog/changelog/2026-10-28-new-tools-triggers-and-cost-controls-for-copilot-automations)
- [Copilot connectors (VS Code Universe releases)](https://github.blog/changelog/2026-10-28-github-copilot-in-vs-code-universe-releases)
- [Security extension](https://github.blog/changelog/2026-10-28-security-extension-for-the-github-copilot-app)
- [AI Scan for repositories](https://github.blog/changelog/2026-10-28-ai-scan-for-repositories-in-public-preview)
