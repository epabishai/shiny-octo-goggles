function decodeXml(value) {
  const entities = {
    amp: "&",
    apos: "'",
    gt: ">",
    lt: "<",
    quot: "\"",
  };

  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&(#x[0-9a-f]+|#\d+|amp|apos|gt|lt|quot);/gi, (match, entity) => {
      if (entity[0] !== "#") {
        return entities[entity.toLowerCase()] || match;
      }

      const codePoint = entity[1].toLowerCase() === "x"
        ? Number.parseInt(entity.slice(2), 16)
        : Number.parseInt(entity.slice(1), 10);
      return Number.isInteger(codePoint) && codePoint >= 0 && codePoint <= 0x10ffff
        ? String.fromCodePoint(codePoint)
        : match;
    });
}

function getField(item, name) {
  const match = item.match(new RegExp(`<${name}\\b[^>]*>([\\s\\S]*?)</${name}>`, "i"));
  return match ? decodeXml(match[1]).trim() : "";
}

function toSummary(description) {
  return description
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function parseFeed(xml) {
  const entries = [...xml.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi)].map((match) => {
    const description = getField(match[1], "description");
    const categories = [...match[1].matchAll(/<category\b[^>]*>([\s\S]*?)<\/category>/gi)]
      .map((category) => decodeXml(category[1]).trim())
      .filter(Boolean);

    return {
      title: getField(match[1], "title"),
      link: getField(match[1], "link"),
      pubDate: getField(match[1], "pubDate"),
      summary: toSummary(description),
      tags: categories,
    };
  });

  return entries;
}

module.exports = parseFeed;
