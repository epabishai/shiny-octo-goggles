# Demo script: Changelog Radar with the GitHub Copilot app

About 25 minutes. Two personas: someone new to the repo (`starter` issues) and a veteran who knows the old code (`legacy-lane` issues).

## Presenter notes: starting state

Keep this page off screen.

| Where | Problem | Used in |
|---|---|---|
| `public/app.js` createCard() | Titles and summaries use `textContent`; retain this safeguard | Act 4 |
| `fixtures/feed.xml` first item | A synthetic community note with harmless `<strong>` markup displayed literally | Act 4 |
| `server.js` `/fixtures/:name` | Only `feed.xml` is allowed; `/fixtures/..%2fpackage.json` must return 404 | Act 4 |
| `package.json` | Express 5.1.0; audit current dependencies rather than planting old versions | Act 4 |
| `src/legacy/parseFeed.js` | Callback-style regex parser, no dedicated characterization tests; API smoke tests exist | Act 2 |
| `test/freshness.test.js` | Freshness is checked against a fixed reference date so the test stays deterministic | Act 1 |

This is a safe starting state, not an intentionally vulnerable deployment. The
community note and deprecation notice are synthetic demo data, not product news.
Topic filtering already exists as a dropdown; issue #3 changes it to chips.
Dark mode and the Deprecations view are left for the live demo.

## Pre-flight

- [ ] `npm install && npm start` works and the page loads offline.
- [ ] Preview with `./scripts/seed-issues.sh --dry-run`, then run `./scripts/seed-issues.sh` in the intended demo repo with authenticated `gh`. It creates labels and issues, skipping existing titles (open or closed, within the first 1,000 issues).
- [ ] `npm run lint` passes (JavaScript syntax checks, not a style linter). `npm test` passes, including the deterministic fixture freshness check.
- [ ] Copilot app signed in. Mode picker, Tool permissions, set to **Assisted**. If it is missing, an enterprise admin may have disabled it in managed settings.
- [ ] Code scanning and AI Scan are enabled on the repo if you plan to run Act 4.
- [ ] For Act 5, your org is on GitHub Enterprise Cloud with the package firewall configured (npm only, public preview).
- [ ] Do one full dry run. Several of these features are days or weeks old.

## Act 1: Onboard the new dev (assisted permissions)

Issues #1 and #2. Watch which requests proceed on their own and which ask you. Narrate it. Do not predict it.

```
I'm new to this repo. Trace how an RSS entry becomes a card on screen, then run the tests and tell me which one is flaky and why.
```

```
Review the fixture freshness test. Explain how comparing a fixed fixture date with the wall clock made CI fail after the cutoff, and why using a fixed reference date makes the check deterministic.
```

## Act 2: Legacy lane (stacked PRs)

Issue #6 (parser rewrite).

```
Modernize src/legacy/parseFeed.js from callbacks to async/await. First add characterization tests against fixtures/feed.xml so behavior doesn't change. Deliver it as a stack of small PRs: tests, refactor, then cleanup.
```

## Act 3: Dynamic workflow (the centerpiece)

Issue #11. Dynamic workflows are in public preview. In the Copilot app they need no setup.

```
Create a dynamic workflow called release-readiness. In code: run npm test, lint, and npm audit. Then review the changed files in parallel with separate agents, and have two models independently assess each finding, reporting only those they agree on. Pause for my review before it writes the summary.
```

Run it. Then ask:

```
What dynamic workflows are available?
```

Talking point: a workflow is a process defined in code, so the stages run the same way every time. Agents are used only where judgment is needed.

## Act 4: Security loop

Issues #8, #9, #10. Open a PR that touches `public/app.js` so AI Scan has something to look at.

```
Add the Deprecations view from issue #5. Follow .github/copilot-instructions.md.
```

Then use issues #8 and #9 to discuss the existing safeguards and their regression
tests: markup remains text and encoded traversal returns 404. Ask the agent to
extend coverage without weakening those protections. Run `npm audit` for issue
#10 and let Dependabot propose updates if any are available. Do not promise
security findings, an autofix, or a dependency PR: this starting state does not
plant vulnerabilities. Check the relevant changelog entries before describing
current AI Scan or agentic autofix behavior.

## Act 5 (optional): Supply chain

Point the agent's registry at the package firewall, then:

```
Add a markdown renderer for the card detail view.
```

To make a block reliable on stage, publish a throwaway package from a test account the day before, so it is inside the cooldown window. Show the exception-request link in the error.

## Act 6 (bonus): Notifications to code

Show a Teams notification, such as a failing CI run, turning into an issue and a PR. Check the entry for current behavior first.

## Issue map

| # | Title | Label | Act |
|---|---|---|---|
| 1 | Explain the feed-to-card pipeline | starter | 1 |
| 2 | Fix the flaky freshness test | starter | 1 |
| 3 | Add tag filter chips | starter | any |
| 4 | Add a dark mode toggle | starter | any |
| 5 | Add a Deprecations view | starter | 4 |
| 6 | Replace the callback parser | legacy-lane | 2 |
| 7 | Cache the feed with ETag support | legacy-lane | 2 |
| 8 | Guard against path traversal in /fixtures/:name | legacy-lane | 4 |
| 9 | Keep timeline titles as text | legacy-lane | 4 |
| 10 | Review dependency updates | legacy-lane | 4 |
| 11 | Release readiness check | legacy-lane | 3 |

Numbers assume the issues are created in the order the seed script lists them in a new repo.
