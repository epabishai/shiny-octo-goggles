const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const parseFeed = require("../src/legacy/parseFeed");

test("the newest fixture entry is no more than a week old at the reference date", async () => {
  const xml = fs.readFileSync(path.join(__dirname, "..", "fixtures", "feed.xml"), "utf8");
  const entries = await parseFeed(xml);
  const newestDate = Math.max(...entries.map((entry) => Date.parse(entry.pubDate)));
  const referenceDate = Date.parse("2026-10-28T12:00:00Z");
  const age = referenceDate - newestDate;
  const week = 7 * 24 * 60 * 60 * 1000;

  assert.ok(age >= 0 && age <= week, "The newest fixture entry is not within a week of the reference date.");
});
