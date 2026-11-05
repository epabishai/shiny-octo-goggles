const fs = require("node:fs");
const path = require("node:path");
const express = require("express");
const parseFeed = require("./src/legacy/parseFeed");
const { filterEntries } = require("./src/lib/tagFilter");

const app = express();
const publicDirectory = path.join(__dirname, "public");
const fixtureXml = fs.readFileSync(path.join(__dirname, "fixtures", "feed.xml"), "utf8");

app.use(express.static(publicDirectory));

app.get("/api/entries", async (request, response) => {
  try {
    const entries = await parseFeed(fixtureXml);
    const tags = [...new Set(entries.flatMap((entry) => entry.tags))].sort();
    const selectedTag = typeof request.query.tag === "string" ? request.query.tag : "";
    const selectedView = typeof request.query.view === "string" ? request.query.view : "";
    response.json({ entries: filterEntries(entries, selectedTag, selectedView), tags });
  } catch {
    response.status(500).json({ error: "Unable to parse the changelog fixture." });
  }
});

app.get("/fixtures/:name", (request, response) => {
  if (request.params.name !== "feed.xml") {
    response.sendStatus(404);
    return;
  }

  response.type("application/rss+xml").send(fixtureXml);
});

app.use((request, response) => {
  response.sendStatus(404);
});

if (require.main === module) {
  const port = Number(process.env.PORT) || 3000;
  app.listen(port, () => {
    console.log(`Changelog Radar is running at http://localhost:${port}`);
  });
}

module.exports = app;
