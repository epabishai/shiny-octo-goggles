const test = require("node:test");
const assert = require("node:assert/strict");
const { filterEntries } = require("../src/lib/tagFilter");

const entries = [
  { title: "First", tags: ["Security", "Repositories"] },
  { title: "Second", tags: ["GitHub Actions"] },
  { title: "Third", tags: [] },
];

test("returns all entries when no topic is selected", () => {
  assert.deepEqual(filterEntries(entries, ""), entries);
});

test("matches tags without regard to surrounding whitespace or case", () => {
  assert.deepEqual(filterEntries(entries, " security "), [entries[0]]);
});

test("returns no entries when a topic does not match", () => {
  assert.deepEqual(filterEntries(entries, "Projects"), []);
});

test("returns an empty list for invalid input", () => {
  assert.deepEqual(filterEntries(null, "Security"), []);
});

const viewEntries = [
  { title: "First retirement", tags: [" Deprecations ", "Security"] },
  { title: "Second retirement", tags: ["DEPRECATIONS", "Actions"] },
  { title: "Deprecations in the title only", tags: ["Security"] },
  { title: "Not an exact tag", tags: ["Deprecations preview"] },
  { title: "Missing tags" },
  { title: "Invalid tags", tags: [null, 42] },
];

test("the Deprecations view matches only exact tags, ignoring case and whitespace", () => {
  assert.deepEqual(filterEntries(viewEntries, "", "deprecations"), viewEntries.slice(0, 2));
});

test("the Deprecations view intersects with the selected topic without mutating entries", () => {
  const original = structuredClone(viewEntries);
  assert.deepEqual(filterEntries(viewEntries, " security ", "deprecations"), [viewEntries[0]]);
  assert.deepEqual(filterEntries(viewEntries, "Deprecations", "deprecations"), viewEntries.slice(0, 2));
  assert.deepEqual(filterEntries(viewEntries, "Repositories", "deprecations"), []);
  assert.deepEqual(viewEntries, original);
});

test("All entries preserves topic filtering and entries without tags", () => {
  assert.deepEqual(filterEntries(viewEntries, "", ""), viewEntries);
  assert.deepEqual(filterEntries(viewEntries, "Security", ""), [viewEntries[0], viewEntries[2]]);
});

test("view filtering handles empty or invalid input and unsupported views", () => {
  assert.deepEqual(filterEntries([], "", "deprecations"), []);
  assert.deepEqual(filterEntries(null, "", "deprecations"), []);
  assert.deepEqual(filterEntries(viewEntries, null, "unknown"), viewEntries);
});
