// Recognizes youtube.com/watch, youtu.be, and youtube.com/embed links and
// extracts the 11-character video id — used to show a real thumbnail in the
// gallery grid and a real embedded player in the lightbox, instead of just
// linking out to an external page.
export function getYouTubeVideoId(url: string): string | null {
  if (!url) return null;
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}

export function getYouTubeThumbnail(url: string): string | null {
  const id = getYouTubeVideoId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
}

export function getYouTubeEmbedUrl(url: string): string | null {
  const id = getYouTubeVideoId(url);
  return id ? `https://www.youtube.com/embed/${id}` : null;
}
