const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  rarr: "→",
  larr: "←",
  ndash: "–",
  mdash: "—",
  hellip: "…",
  euro: "€",
  auml: "ä",
  ouml: "ö",
  uuml: "ü",
  otilde: "õ",
  Auml: "Ä",
  Ouml: "Ö",
  Uuml: "Ü",
  Otilde: "Õ",
  aring: "å",
  Aring: "Å",
  scaron: "š",
  Scaron: "Š",
  zcaron: "ž",
  Zcaron: "Ž",
};

// Upstream sends HTML fragments. Converts them to plain text so the UI never renders upstream markup.
export function toPlainText(str: string) {
  return str
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, entity: string) => {
      if (entity[0] === "#") {
        const code =
          entity[1]?.toLowerCase() === "x"
            ? parseInt(entity.slice(2), 16)
            : parseInt(entity.slice(1), 10);
        return Number.isFinite(code) ? String.fromCodePoint(code) : match;
      }

      return NAMED_ENTITIES[entity] ?? match;
    })
    .replace(/[ \t]+/g, " ")
    .trim();
}
