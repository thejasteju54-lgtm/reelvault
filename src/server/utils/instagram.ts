export interface InstagramParseResult {
  isValid: boolean;
  shortcode?: string;
  canonicalUrl?: string;
  error?: string;
}

// Regex matching Instagram shortcode characters (alphanumeric, underscores, hyphens)
const SHORTCODE_REGEX = /^[A-Za-z0-9_-]{5,35}$/;

/**
 * Validates and normalizes an Instagram Reel or Post URL.
 * Extracts the canonical shortcode and strips tracking/unnecessary query parameters.
 */
export function parseInstagramUrl(rawInput: string): InstagramParseResult {
  if (!rawInput || typeof rawInput !== 'string') {
    return { isValid: false, error: 'URL is required.' };
  }

  const trimmed = rawInput.trim();

  // Explicitly reject dangerous pseudo-protocols
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('data:') ||
    lower.startsWith('vbscript:') ||
    lower.startsWith('file:')
  ) {
    return { isValid: false, error: 'Invalid URL protocol.' };
  }

  let parsed: URL;
  try {
    // Add https:// protocol if user entered instagram.com/... directly
    const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    parsed = new URL(withProtocol);
  } catch {
    return { isValid: false, error: 'Malformed URL.' };
  }

  // Validate allowed hostname
  const host = parsed.hostname.toLowerCase();
  const allowedHosts = [
    'instagram.com',
    'www.instagram.com',
    'm.instagram.com',
    'instagr.am',
    'www.instagr.am'
  ];

  if (!allowedHosts.includes(host)) {
    return {
      isValid: false,
      error: 'Only Instagram URLs (instagram.com / instagr.am) are supported.'
    };
  }

  // Extract path segments (e.g., /reel/C3_aBcDeF/)
  const segments = parsed.pathname
    .split('/')
    .map((s) => s.trim())
    .filter(Boolean);

  if (segments.length < 2) {
    return {
      isValid: false,
      error: 'URL path is too short to be an Instagram Reel or post.'
    };
  }

  const prefix = segments[0].toLowerCase();
  // We accept reel, reels, and p (posts containing reels)
  if (!['reel', 'reels', 'p'].includes(prefix)) {
    return {
      isValid: false,
      error: 'URL must point to an Instagram Reel (/reel/ or /reels/) or Post (/p/).'
    };
  }

  const shortcodeCandidate = segments[1];
  if (!SHORTCODE_REGEX.test(shortcodeCandidate)) {
    return {
      isValid: false,
      error: 'Invalid Instagram shortcode format.'
    };
  }

  const canonicalUrl = `https://www.instagram.com/reel/${shortcodeCandidate}/`;

  return {
    isValid: true,
    shortcode: shortcodeCandidate,
    canonicalUrl
  };
}

/**
 * Normalizes a list of tag strings:
 * - Trims whitespace
 * - Strips leading '#'
 * - Converts to lowercase
 * - Strips invalid punctuation
 * - Removes duplicates and empty values
 */
export function normalizeTags(rawTags: unknown[] = []): string[] {
  if (!Array.isArray(rawTags)) return [];

  const cleaned = rawTags
    .filter((t): t is string => typeof t === 'string')
    .map((t) => t.trim().toLowerCase().replace(/^#+/, '').replace(/[^a-z0-9_-]/g, ''))
    .filter((t) => t.length > 0 && t.length <= 50);

  return Array.from(new Set(cleaned));
}
