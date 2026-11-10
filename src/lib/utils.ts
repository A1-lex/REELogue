export function getYouTubeEmbedUrl(url?: string): string | null {
  if (!url) return null;
  
  let videoId = null;
  if (url.includes('youtube.com/watch?v=')) {
    videoId = url.split('v=')[1]?.split('&')[0];
  } else if (url.includes('youtu.be/')) {
    videoId = url.split('youtu.be/')[1]?.split('?')[0];
  }

  return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : null;
}