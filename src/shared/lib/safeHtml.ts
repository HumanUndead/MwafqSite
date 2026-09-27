/**
 * Conservative cleanup for dashboard-authored rich text before it is set
 * with `dangerouslySetInnerHTML`: drops active elements, event handlers and
 * script URLs. The content comes from the Mwafq admin, not end users.
 */
export function safeHtml(html: string | null | undefined): string {
  if (!html) return '';
  return html
    .replace(/<(script|style|iframe|object|embed|form|input|button|link|meta)\b[\s\S]*?(<\/\1>|\/?>)/gi, '')
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/\s(href|src|xlink:href)\s*=\s*("|')\s*(javascript|vbscript|data):[^"']*\2/gi, '')
    .replace(/\sstyle\s*=\s*("[^"]*expression[^"]*"|'[^']*expression[^']*')/gi, '');
}
