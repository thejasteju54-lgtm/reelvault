import { describe, it, expect } from 'vitest';
import { normalizeInstagramUrl } from '../src/utils/url';

describe('URL Normalization', () => {
  it('should parse standard reel url', () => {
    const result = normalizeInstagramUrl('https://www.instagram.com/reel/C3b4Xyz890_/?igsh=MW...');
    expect(result).not.toBeNull();
    expect(result?.shortcode).toBe('C3b4Xyz890_');
    expect(result?.canonical_url).toBe('https://www.instagram.com/reel/C3b4Xyz890_/');
  });

  it('should parse /reels/ path', () => {
    const result = normalizeInstagramUrl('https://www.instagram.com/reels/xyz123abc/');
    expect(result?.shortcode).toBe('xyz123abc');
  });

  it('should parse /p/ path', () => {
    const result = normalizeInstagramUrl('https://www.instagram.com/p/abc987xyz/?igsh=xxx');
    expect(result?.shortcode).toBe('abc987xyz');
    expect(result?.canonical_url).toBe('https://www.instagram.com/reel/abc987xyz/');
  });

  it('should reject non-instagram urls', () => {
    const result = normalizeInstagramUrl('https://www.tiktok.com/@user/video/123456');
    expect(result).toBeNull();
  });

  it('should reject invalid instagram paths', () => {
    const result = normalizeInstagramUrl('https://www.instagram.com/direct/inbox/');
    expect(result).toBeNull();
  });
});
