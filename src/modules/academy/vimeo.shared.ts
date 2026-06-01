/** Convert any Vimeo URL form to the player embed URL. */
export function getVimeoEmbedUrl(url: string): string {
  if (!url) return url;
  const match = url.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/);
  if (match && match[1]) {
    return `https://player.vimeo.com/video/${match[1]}`;
  }
  return url;
}
