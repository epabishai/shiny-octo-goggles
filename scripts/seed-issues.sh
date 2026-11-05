#!/usr/bin/env bash
set -euo pipefail

if [[ $# -gt 1 || ( $# -eq 1 && "$1" != "--dry-run" ) ]]; then
  echo "Usage: $0 [--dry-run]" >&2
  exit 1
fi

dry_run=false
if [[ $# -eq 1 ]]; then
  dry_run=true
fi

if [[ "$dry_run" == false ]]; then
  # Resolve the target from this checkout, not the caller's working directory.
  cd "$(dirname "$0")/.."
  repo=$(gh repo view --json nameWithOwner --jq .nameWithOwner)
  existing_titles=$(gh issue list --repo "$repo" --state all --limit 1000 --json title --jq '.[].title')
  gh label create starter --repo "$repo" --color 0E8A16 --description "New contributor demo tasks" --force
  gh label create legacy-lane --repo "$repo" --color 5319E7 --description "Experienced contributor demo tasks" --force
fi

while IFS='|' read -r label title body; do
  if [[ "$dry_run" == true ]]; then
    printf '[%s] %s\n%s\n\n' "$label" "$title" "$body"
  elif printf '%s\n' "$existing_titles" | grep -Fx -- "$title" > /dev/null; then
    printf 'Already exists: %s\n' "$title"
  else
    gh issue create --repo "$repo" --label "$label" --title "$title" --body "$body"
  fi
done <<'ISSUES'
starter|Explain the feed-to-card pipeline|Trace fixtures/feed.xml through server.js and src/legacy/parseFeed.js to public/app.js. Explain filtering and error handling, then run npm test and identify the date-sensitive test. Do not change code.
starter|Fix the flaky freshness test|test/freshness.test.js uses the wall clock against a fixed fixture date. Make it deterministic on any day without changing fixture dates or skipping the assertion. Explain the cause in the PR description.
starter|Add tag filter chips|Replace the topic dropdown with accessible tag filter chips. Preserve the All topics option and case-insensitive filtering. Keep rendering feed content as text and add deterministic tests for reusable logic.
starter|Add a dark mode toggle|Add an accessible light/dark mode toggle with a persisted preference. Preserve filtering, readable contrast and the offline fixture-backed experience.
starter|Add a Deprecations view|Add an accessible view that shows entries tagged Deprecations, with an All entries view and an empty state. Compose it with topic filtering. Use fixtures/feed.xml and follow .github/copilot-instructions.md; render titles and summaries as text. Add deterministic tests for reusable logic.
legacy-lane|Replace the callback parser|First add characterization tests for src/legacy/parseFeed.js against fixtures/feed.xml, including dates, tags, summaries and the literal markup title. Then migrate the callback API and its caller to async/await without changing output. Deliver a stack of small PRs: tests, refactor, cleanup.
legacy-lane|Cache the feed with ETag support|Add ETag and If-None-Match support to /api/entries while keeping the committed fixture as the only data source. Account for topic-filtered responses and test 200/304 behavior deterministically.
legacy-lane|Guard against path traversal in /fixtures/:name|The fixture route already restricts access to feed.xml. Add regression tests for /fixtures/feed.xml, unknown names and /fixtures/..%2fpackage.json. Preserve the allowlist; do not introduce a vulnerable route.
legacy-lane|Keep timeline titles as text|The first fixture title includes harmless markup. Add a regression test proving it is displayed literally rather than interpreted as HTML. Preserve textContent rendering for both titles and summaries; do not add executable payloads.
legacy-lane|Review dependency updates|Run npm audit and inspect maintained Express releases and relevant changelog entries. Propose only justified dependency updates with a synchronized lockfile. Do not downgrade dependencies or add xml2js solely for the demo.
legacy-lane|Release readiness check|Create a dynamic workflow called release-readiness in the Copilot app. Run npm test, npm run lint and npm audit, review changed files in parallel, and have two models independently assess each finding. Report only agreed findings and pause for presenter review before writing the summary. Expect the planted freshness failure until Act 1 is complete.
ISSUES
