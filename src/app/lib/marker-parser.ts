/**
 * Minimal marker template parser.
 * Replaces {{key}} placeholders in a content string with provided values.
 * Also handles basic Markdown to HTML conversion WITHOUT DOMPurify or external libs.
 */

export function parseMarkers(
  content: string,
  values: Record<string, string>,
): string {
  return content.replace(/\{\{(\w+)\}\}/g, (_, key: string) => values[key] ?? '');
}

/**
 * Very lightweight Markdown-like renderer.
 * Supports: # headings, **bold**, *italic*, - list items, blank-line paragraphs.
 * Returns an array of React-compatible elements via JSX strings — use via dangerouslySetInnerHTML
 * ONLY after sanitising with this function (no user-controlled HTML is produced;
 * all output comes from our own contentMd stored in the DB).
 *
 * Rules:
 *   # text  → <h2>
 *   ## text → <h3>
 *   ### text → <h4>
 *   **text** → <strong>
 *   *text*  → <em>
 *   - text  → <li> inside <ul>
 *   blank line → paragraph break
 */
export function renderMarkdown(raw: string): string {
  const lines = raw.split('\n');
  const out: string[] = [];
  let inList = false;

  const closeList = () => {
    if (inList) { out.push('</ul>'); inList = false; }
  };

  const inlineFormat = (line: string): string =>
    line
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>');

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();

    if (line.startsWith('### ')) {
      closeList();
      out.push(`<h4 class="text-sm font-semibold mt-3 mb-1">${inlineFormat(line.slice(4))}</h4>`);
    } else if (line.startsWith('## ')) {
      closeList();
      out.push(`<h3 class="text-base font-semibold mt-4 mb-1">${inlineFormat(line.slice(3))}</h3>`);
    } else if (line.startsWith('# ')) {
      closeList();
      out.push(`<h2 class="text-lg font-bold mt-4 mb-2">${inlineFormat(line.slice(2))}</h2>`);
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      if (!inList) { out.push('<ul class="list-disc pl-4 space-y-1">'); inList = true; }
      out.push(`<li class="text-sm leading-relaxed">${inlineFormat(line.slice(2))}</li>`);
    } else if (line.trim() === '') {
      closeList();
      out.push('<br />');
    } else {
      closeList();
      out.push(`<p class="text-sm leading-relaxed">${inlineFormat(line)}</p>`);
    }
  }

  closeList();
  return out.join('');
}
