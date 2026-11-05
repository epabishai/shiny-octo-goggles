const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

test("cards assign untrusted titles and summaries as text, never HTML", () => {
  const elements = [];
  function createElement(tagName) {
    const node = {
      tagName,
      children: [],
      textContent: "",
      setAttribute() {},
      append(...children) { this.children.push(...children); },
    };
    Object.defineProperty(node, "innerHTML", {
      set() { assert.fail("Feed content must not be assigned to innerHTML"); },
    });
    elements.push(node);
    return node;
  }

  const source = fs.readFileSync(path.join(__dirname, "..", "public", "app.js"), "utf8");
  const context = vm.createContext({
    document: {
      documentElement: { dataset: {} },
      createElement,
      querySelector() {
        return { value: "", addEventListener() {}, replaceChildren() {}, setAttribute() {} };
      },
    },
    fetch: () => new Promise(() => {}),
  });
  vm.runInContext(source, context);
  const entry = {
    title: "Community note: <strong>render feed titles as text</strong>",
    summary: "<em>This summary must also stay text.</em>",
    pubDate: "Wed, 21 Oct 2026 12:00:00 +0000",
    tags: ["<strong>Community</strong>"],
  };
  const card = context.createCard(entry);
  assert.equal(card.children.find((node) => node.tagName === "h2").textContent, entry.title);
  assert.equal(card.children.find((node) => node.tagName === "p").textContent, entry.summary);
  assert.equal(elements.find((node) => node.tagName === "span").textContent, entry.tags[0]);
  assert.equal(elements.some((node) => ["strong", "em"].includes(node.tagName)), false);
});

test("theme toggle restores and persists the accessible preference", () => {
  const elements = new Map();
  for (const selector of ["#entries", "#tag-filter", "#view-filter", "#entry-count", "#status", "#theme-toggle"]) {
    elements.set(selector, {
      value: "",
      attributes: {},
      listeners: {},
      addEventListener(event, listener) { this.listeners[event] = listener; },
      setAttribute(name, value) { this.attributes[name] = value; },
      replaceChildren() {},
    });
  }
  const document = {
    documentElement: { dataset: {} },
    querySelector(selector) { return elements.get(selector); },
  };
  const stored = new Map([["theme", "dark"]]);
  const context = vm.createContext({
    document,
    window: {
      localStorage: {
        getItem(key) { return stored.get(key); },
        setItem(key, value) { stored.set(key, value); },
      },
    },
    fetch: () => new Promise(() => {}),
  });

  const source = fs.readFileSync(path.join(__dirname, "..", "public", "app.js"), "utf8");
  vm.runInContext(source, context);

  const toggle = elements.get("#theme-toggle");
  assert.equal(document.documentElement.dataset.theme, "dark");
  assert.equal(toggle.attributes["aria-pressed"], "true");
  toggle.listeners.click();
  assert.equal(document.documentElement.dataset.theme, "light");
  assert.equal(toggle.attributes["aria-pressed"], "false");
  assert.equal(stored.get("theme"), "light");
});

test("view changes compose with topics, announce empty results, and restore All entries", async () => {
  const parseFeed = require("../src/legacy/parseFeed");
  const { filterEntries } = require("../src/lib/tagFilter");
  const entries = await parseFeed(
    fs.readFileSync(path.join(__dirname, "..", "fixtures", "feed.xml"), "utf8"),
  );
  const tags = [...new Set(entries.flatMap((entry) => entry.tags))].sort();
  function createElement(tagName) {
    const node = {
      tagName,
      value: "",
      textContent: "",
      children: [],
      listeners: {},
      setAttribute() {},
      addEventListener(event, listener) { this.listeners[event] = listener; },
      append(...children) { this.children.push(...children); },
      replaceChildren(...children) { this.children = children; },
      add(option) { this.children.push(option); },
    };
    Object.defineProperty(node, "innerHTML", {
      set() { assert.fail("Feed content must not be assigned to innerHTML"); },
    });
    return node;
  }
  const elements = new Map(
    ["#entries", "#tag-filter", "#view-filter", "#entry-count", "#status", "#theme-toggle"]
      .map((selector) => [selector, createElement("div")]),
  );
  const requests = [];
  const context = vm.createContext({
    document: {
      documentElement: { dataset: {} },
      querySelector(selector) { return elements.get(selector); },
      createElement,
    },
    Option: function(text, value) { this.textContent = text; this.value = value; },
    fetch: async (url) => {
      requests.push(url);
      const params = new URL(url, "http://localhost").searchParams;
      return {
        ok: true,
        json: async () => ({
          entries: filterEntries(entries, params.get("tag"), params.get("view")),
          tags,
        }),
      };
    },
  });
  const source = fs.readFileSync(path.join(__dirname, "..", "public", "app.js"), "utf8");
  vm.runInContext(source, context);
  await new Promise(setImmediate);
  const view = elements.get("#view-filter");
  const topic = elements.get("#tag-filter");
  const cards = elements.get("#entries");
  const count = elements.get("#entry-count");
  const status = elements.get("#status");
  assert.equal(cards.children.length, entries.length);

  view.value = "deprecations";
  await view.listeners.change();
  assert.equal(requests.at(-1), "/api/entries?view=deprecations");
  assert.equal(cards.children.length, 2);
  assert.equal(count.textContent, "2 entries");
  assert.equal(status.textContent, "");
  assert.deepEqual(topic.children.map((option) => option.value), ["", ...tags]);

  topic.value = "copilot";
  await topic.listeners.change();
  assert.equal(requests.at(-1), "/api/entries?tag=copilot&view=deprecations");
  assert.equal(cards.children.length, 1);
  assert.equal(count.textContent, "1 entry");
  assert.equal(topic.value, "copilot");

  topic.value = "release";
  await topic.listeners.change();
  assert.equal(cards.children.length, 0);
  assert.equal(count.textContent, "0 entries");
  assert.equal(status.textContent, "No deprecations match the selected topic.");

  view.value = "";
  await view.listeners.change();
  assert.equal(requests.at(-1), "/api/entries?tag=release");
  assert.equal(topic.value, "release");
  assert.equal(cards.children.length, filterEntries(entries, "release").length);
  assert.equal(status.textContent, "");

  topic.value = "";
  await topic.listeners.change();
  assert.equal(requests.at(-1), "/api/entries");
  assert.equal(cards.children.length, entries.length);
});
