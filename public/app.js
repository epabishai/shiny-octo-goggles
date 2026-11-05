const entryContainer = document.querySelector("#entries");
const tagFilter = document.querySelector("#tag-filter");
const viewFilter = document.querySelector("#view-filter");
const entryCount = document.querySelector("#entry-count");
const statusMessage = document.querySelector("#status");
const themeToggle = document.querySelector("#theme-toggle");

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  themeToggle.setAttribute("aria-pressed", String(theme === "dark"));
}

function loadThemePreference() {
  try {
    const preference = window.localStorage.getItem("theme");
    return preference === "dark" || preference === "light" ? preference : "light";
  } catch {
    return "light";
  }
}

function formatDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Date unavailable"
    : new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date);
}

function createCard(entry) {
  const card = document.createElement("article");
  card.className = "card";

  const date = document.createElement("time");
  date.textContent = formatDate(entry.pubDate);
  const heading = document.createElement("h2");
  heading.textContent = entry.title || "Untitled changelog entry";
  const summary = document.createElement("p");
  summary.textContent = entry.summary || "No summary is available.";
  const tags = document.createElement("div");
  tags.className = "tags";
  tags.setAttribute("aria-label", "Topics");

  for (const tag of entry.tags) {
    const badge = document.createElement("span");
    badge.className = "tag";
    badge.textContent = tag;
    tags.append(badge);
  }

  card.append(date, heading, summary, tags);
  return card;
}

function updateTagOptions(tags) {
  const selectedTag = tagFilter.value;
  tagFilter.replaceChildren(new Option("All topics", ""));

  for (const tag of tags) {
    tagFilter.add(new Option(tag, tag));
  }

  if (tags.includes(selectedTag)) {
    tagFilter.value = selectedTag;
  }
}

async function loadEntries() {
  statusMessage.textContent = "Loading changelog…";
  entryContainer.replaceChildren();

  try {
    const params = [];
    if (tagFilter.value) {
      params.push(`tag=${encodeURIComponent(tagFilter.value)}`);
    }
    if (viewFilter.value) {
      params.push(`view=${encodeURIComponent(viewFilter.value)}`);
    }
    const query = params.length ? `?${params.join("&")}` : "";
    const response = await fetch(`/api/entries${query}`);
    if (!response.ok) {
      throw new Error("The changelog could not be loaded.");
    }

    const { entries, tags } = await response.json();
    updateTagOptions(tags);
    for (const entry of entries) {
      entryContainer.append(createCard(entry));
    }
    entryCount.textContent = `${entries.length} ${entries.length === 1 ? "entry" : "entries"}`;
    statusMessage.textContent = entries.length ? "" : viewFilter.value === "deprecations"
      ? "No deprecations match the selected topic."
      : "No entries match this topic.";
  } catch {
    entryCount.textContent = "";
    statusMessage.textContent = "Unable to load the changelog. Please try again.";
  }
}

tagFilter.addEventListener("change", loadEntries);
viewFilter.addEventListener("change", loadEntries);
themeToggle.addEventListener("click", () => {
  const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  applyTheme(nextTheme);
  try {
    window.localStorage.setItem("theme", nextTheme);
  } catch {}
});
applyTheme(loadThemePreference());
loadEntries();
