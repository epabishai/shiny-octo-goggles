# Changelog Radar

A small, fixture-backed Node.js app that turns the GitHub changelog RSS feed into filterable cards with a short summary for each entry.

The demo reads from [`fixtures/feed.xml`](fixtures/feed.xml), so it works without a network connection.

## Run locally

Requires Node.js 20 or newer.

```sh
npm install
npm start
```

Open <http://localhost:3000>. Choose a topic to filter the cards, or use the Dark mode button to switch themes; your choice is saved in this browser. The API also supports `GET /api/entries?tag=Security`, and `GET /fixtures/feed.xml` serves the committed fixture.

Choose **Deprecations** in the View selector to show only entries tagged Deprecations,
or **All entries** to return to the full feed. Topic filtering applies in both views;
an empty state appears when no entries match. The API supports the same combination,
for example `GET /api/entries?view=deprecations&tag=copilot`.

Run the tests with `npm test` and JavaScript syntax checks with `npm run lint`.

## Release readiness

The project Copilot dynamic workflow `release-readiness` requires a recent
Copilot CLI with experimental features enabled (`copilot --experimental`).
Trust this repository, load its extension in a new session, and ask Copilot
to list the available dynamic workflows to confirm registration.
The Copilot host supplies the extension SDK; no application dependency is needed.

Install dependencies with `npm ci` first. Fetch your comparison branch if it is
not available locally (for example, `git fetch origin main`). Then ask Copilot:

```text
Run the release-readiness dynamic workflow with baseRef "origin/main" and
models ["<first available model ID>", "<second available model ID>"].
```

Choose two distinct model IDs available to your account. The workflow runs
`npm test`, `npm run lint`, and `npm audit` in code, retaining failures rather
than skipping subsequent checks. Audit requires access to the npm registry.
It reviews each tracked changed file in parallel against the merge base of
`baseRef` and `HEAD`, including committed, staged, unstaged, and deleted files.
Untracked files are not reviewed; stage new files first.

Each proposed finding is independently assessed by both models. Only findings
both affirm are reported; failed reviews or assessments are marked as incomplete
coverage. Agents receive captured diffs and are instructed not to edit or execute
commands. Normal Copilot permissions still apply to agents; the extension itself
executes the fixed npm and Git commands directly, so run it only in trusted code.

The workflow displays check results and agreed findings, then **pauses before
generating its summary**, even when there are no findings. Review the results
in the session, open `/workflows`, and resume that run only when ready.
Resume reuses the saved checks and reviews; start a new run if the code changes.
The summary is returned to the session, not written to a repository file.

## Run with Docker

Requires Docker with Compose.

```sh
docker compose up --build
```

Open <http://localhost:3000>. Stop the app with `Ctrl+C`, or run `docker compose down`.

## Presenter setup

Follow [the demo walkthrough](demo/demo.md) for the acts and pre-flight checklist.
Preview the eleven demo issues with `./scripts/seed-issues.sh --dry-run`, then run
`./scripts/seed-issues.sh` to create them in this checkout's GitHub repository
(requires authenticated `gh`). Existing issue titles are skipped, including closed
issues within the first 1,000 results. Issue numbers match the walkthrough only in
a new repository.

The parser now uses async/await; the Deprecations view composes with topic filtering.

The fixture includes synthetic community and deprecation entries. Title markup
is rendered as literal text, and fixture access stays restricted to `feed.xml`.
The security act verifies safeguards rather than introducing vulnerabilities.

## Project structure

- `server.js` serves the static app, `/api/entries`, and the committed fixture.
- `src/legacy/parseFeed.js` is an async, regex-based RSS parser retained as a legacy example.
- `src/lib/tagFilter.js` provides tested, case-insensitive topic and Deprecations filtering.
- `public/` contains the browser app and styles.
- `fixtures/feed.xml` provides offline sample data.
- `test/` contains deterministic regression tests.
- `scripts/` provides syntax checking and repeatable demo issue setup.

See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidance.