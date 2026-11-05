# Contributing

Thanks for helping improve Changelog Radar. The app is a small Node.js demo that uses a committed RSS fixture, so development and CI do not depend on network access.

## Get started

1. Install Node.js 20 or newer.
2. Run `npm ci`.
3. Run `npm test` and `npm run lint`.
4. Run `npm start` and open <http://localhost:3000>.

## Project areas

- `src/legacy/parseFeed.js` is async, regex-based feed parsing retained as a legacy example.
- `src/lib/tagFilter.js` contains the small, tested filtering utility.
- `public/` contains the browser UI; render feed values as text rather than HTML.
- `fixtures/feed.xml` is the offline demo data.

Keep tests deterministic and avoid adding dependencies unless they are needed.
See [the presenter walkthrough](demo/demo.md) for setup and issue seeding.
