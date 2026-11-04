export type Inline = { text: string; bold?: boolean; href?: string };

const unescape = (value: string) => value.replace(/\\([.#\-*_[\]()])/g, '$1');

/** Parse the site's inline emphasis and links, including parentheses in DOI URLs. */
export function parseInlineMarkup(
  raw: string,
  rewriteHref: (href: string) => string = href => href,
): Inline[] {
  const out: Inline[] = [];
  const re = /\*\*(.+?)\*\*|\[([^\]]+)\]\(((?:[^()\s]|\([^()\s]*\))+)(?:\s+"[^"]*")?\)/g;
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = re.exec(raw))) {
    if (match.index > last) out.push({ text: unescape(raw.slice(last, match.index)) });
    if (match[1] !== undefined) {
      out.push(...parseInlineMarkup(match[1], rewriteHref).map(item => ({ ...item, bold: true })));
    } else {
      out.push({ text: unescape(match[2]), href: rewriteHref(match[3]) });
    }
    last = re.lastIndex;
  }
  if (last < raw.length) out.push({ text: unescape(raw.slice(last)) });
  return out;
}
