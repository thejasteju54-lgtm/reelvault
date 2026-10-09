export function normalizeInstagramUrl(url: string): { canonical_url: string; shortcode: string } | null {
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes('instagram.com')) {
      return null;
    }
    
    // Valid reel paths: /reel/<shortcode>/, /reels/<shortcode>/, /p/<shortcode>/
    const match = parsed.pathname.match(/\/(?:reel|reels|p)\/([a-zA-Z0-9_-]+)/);
    if (!match || !match[1]) {
      return null;
    }
    
    const shortcode = match[1];
    return {
      canonical_url: `https://www.instagram.com/reel/${shortcode}/`,
      shortcode
    };
  } catch (error) {
    return null;
  }
}
