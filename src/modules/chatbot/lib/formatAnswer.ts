/**
 * Minimal markdown normalizer for chatbot answers.
 *
 * The upstream FAQ model emits light markdown (`**bold**`, `#` headings,
 * `-`/`*`/`1.` lists). We render that structure natively instead of shipping a
 * markdown library — the grammar in play is small and fixed, and the output is
 * plain React text nodes, so answer content can never inject markup.
 */

export type InlineSegment = { text: string; bold: boolean };

export type AnswerBlock =
  | { kind: 'heading'; content: InlineSegment[] }
  | { kind: 'paragraph'; content: InlineSegment[] }
  | { kind: 'list'; ordered: boolean; items: InlineSegment[][] };

const HEADING = /^\s{0,3}#{1,6}\s+(.*)$/;
const BULLET = /^\s*[-*•]\s+(.*)$/;
const ORDERED = /^\s*\d+[.)]\s+(.*)$/;

/** Removes unpaired emphasis/code markers so no raw syntax reaches the user. */
function cleanInline(text: string): string {
  return text
    .replace(/`{1,3}/g, '')
    .replace(/\[(.+?)\]\((.+?)\)/g, '$1')
    .replace(/(\*\*|__|\*|_)/g, '');
}

/** Splits `**bold**` / `__bold__` runs, dropping the delimiters. */
export function parseInline(text: string): InlineSegment[] {
  const segments: InlineSegment[] = [];
  const pattern = /\*\*(.+?)\*\*|__(.+?)__/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ text: text.slice(lastIndex, match.index), bold: false });
    }
    segments.push({ text: match[1] ?? match[2] ?? '', bold: true });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    segments.push({ text: text.slice(lastIndex), bold: false });
  }

  return segments
    .map((segment) => ({ ...segment, text: cleanInline(segment.text) }))
    .filter((segment) => segment.text.length > 0);
}

export function formatAnswer(raw: string): AnswerBlock[] {
  const blocks: AnswerBlock[] = [];
  const lines = raw.replace(/\r\n/g, '\n').split('\n');

  let paragraph: string[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;

  const flushParagraph = () => {
    if (paragraph.length === 0) return;
    const content = parseInline(paragraph.join(' ').trim());
    if (content.length > 0) blocks.push({ kind: 'paragraph', content });
    paragraph = [];
  };

  const flushList = () => {
    if (list && list.items.length > 0) {
      blocks.push({
        kind: 'list',
        ordered: list.ordered,
        items: list.items.map(parseInline).filter((item) => item.length > 0),
      });
    }
    list = null;
  };

  for (const line of lines) {
    if (line.trim().length === 0) {
      flushParagraph();
      flushList();
      continue;
    }

    const heading = HEADING.exec(line);
    if (heading) {
      flushParagraph();
      flushList();
      const content = parseInline(heading[1].trim());
      if (content.length > 0) blocks.push({ kind: 'heading', content });
      continue;
    }

    const ordered = ORDERED.exec(line);
    const bullet = BULLET.exec(line);

    if (ordered || bullet) {
      flushParagraph();
      const isOrdered = Boolean(ordered);
      const item = (ordered?.[1] ?? bullet?.[1] ?? '').trim();

      // A change of list type starts a new list.
      if (list && list.ordered !== isOrdered) flushList();
      if (!list) list = { ordered: isOrdered, items: [] };
      list.items.push(item);
      continue;
    }

    flushList();
    paragraph.push(line.trim());
  }

  flushParagraph();
  flushList();

  return blocks;
}
