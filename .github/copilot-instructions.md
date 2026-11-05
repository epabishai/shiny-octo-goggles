# Copilot instructions

- Keep changes small and focused on the changelog demo.
- Use `fixtures/feed.xml` for local and test data; do not make tests depend on the live GitHub site.
- Treat feed content as untrusted: create DOM nodes and assign text with `textContent`.
- Keep fixture file access restricted to the committed fixture.
- Add deterministic tests for reusable logic in `src/lib/`.
- Use Node.js 20 or newer and the existing npm scripts.
