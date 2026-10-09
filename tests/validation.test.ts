import { describe, it, expect } from 'vitest';
import { SaveReelSchema, UpdateReelSchema } from '../src/utils/validation';

describe('Zod Validation Schemas', () => {
  it('should validate valid save reel input', () => {
    const result = SaveReelSchema.safeParse({
      url: 'https://www.instagram.com/reel/C3b4Xyz890_/',
      title: 'A cool reel',
      tagNames: ['ai', 'tech']
    });
    expect(result.success).toBe(true);
  });

  it('should reject invalid url format', () => {
    const result = SaveReelSchema.safeParse({
      url: 'https://www.instagram.com/explore/'
    });
    expect(result.success).toBe(false);
  });

  it('should reject excessive tags', () => {
    const result = SaveReelSchema.safeParse({
      url: 'https://www.instagram.com/reel/C3b4Xyz890_/',
      tagNames: Array.from({ length: 15 }, (_, i) => `tag${i}`)
    });
    expect(result.success).toBe(false);
  });

  it('should validate update reel input', () => {
    const result = UpdateReelSchema.safeParse({
      is_watched: true,
      tagNames: ['updated']
    });
    expect(result.success).toBe(true);
  });
});
