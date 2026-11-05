function filterEntries(entries, tag, view = "") {
  if (!Array.isArray(entries)) {
    return [];
  }

  const selectedTags = [
    typeof tag === "string" ? tag.trim().toLowerCase() : "",
    view === "deprecations" ? "deprecations" : "",
  ].filter(Boolean);
  if (!selectedTags.length) {
    return entries;
  }

  return entries.filter((entry) =>
    Array.isArray(entry.tags)
    && selectedTags.every((selectedTag) => entry.tags.some((entryTag) =>
      typeof entryTag === "string" && entryTag.trim().toLowerCase() === selectedTag)));
}

module.exports = { filterEntries };
