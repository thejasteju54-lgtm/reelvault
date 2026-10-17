import { Reel } from '../../types/index.js';

const STORAGE_PREFIX = 'reelvault_vault_reels_';
const GLOBAL_BACKUP_KEY = 'reelvault_reels_global_backup';

function getStorageKey(userId?: string): string {
  return userId ? `${STORAGE_PREFIX}${userId}` : GLOBAL_BACKUP_KEY;
}

export const vaultStorage = {
  /**
   * Load locally cached reels for the current user.
   */
  loadReels(userId?: string): Reel[] {
    try {
      const key = getStorageKey(userId);
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
      // Check global backup fallback
      if (userId) {
        const backupRaw = localStorage.getItem(GLOBAL_BACKUP_KEY);
        if (backupRaw) {
          const backupParsed = JSON.parse(backupRaw);
          if (Array.isArray(backupParsed) && backupParsed.length > 0) {
            return backupParsed.filter((r) => !r.userId || r.userId === userId);
          }
        }
      }
    } catch (err) {
      console.warn('[VaultStorage] Failed to read from localStorage:', err);
    }
    return [];
  },

  /**
   * Persist full list of reels to local storage.
   */
  saveReels(userId: string | undefined, reels: Reel[]): void {
    try {
      const key = getStorageKey(userId);
      const json = JSON.stringify(reels);
      localStorage.setItem(key, json);
      // Keep global backup
      localStorage.setItem(GLOBAL_BACKUP_KEY, json);
    } catch (err) {
      console.warn('[VaultStorage] Failed to save to localStorage:', err);
    }
  },

  /**
   * Add a newly saved reel or update an existing one locally.
   */
  addOrUpdateReel(userId: string | undefined, reel: Reel): Reel[] {
    const current = this.loadReels(userId);
    const existingIndex = current.findIndex(
      (r) => r.id === reel.id || (r.instagramShortcode && r.instagramShortcode === reel.instagramShortcode)
    );

    let updated: Reel[];
    if (existingIndex !== -1) {
      updated = [...current];
      updated[existingIndex] = { ...updated[existingIndex], ...reel };
    } else {
      updated = [reel, ...current];
    }

    this.saveReels(userId, updated);
    return updated;
  },

  /**
   * Remove a reel by ID from local storage.
   */
  removeReel(userId: string | undefined, reelId: string): Reel[] {
    const current = this.loadReels(userId);
    const filtered = current.filter((r) => r.id !== reelId);
    this.saveReels(userId, filtered);
    return filtered;
  },

  /**
   * Smart merge server reels with locally cached reels.
   * Ensures locally saved reels are never lost when serverless instances spin down.
   */
  mergeReels(cached: Reel[], incoming: Reel[]): Reel[] {
    const map = new Map<string, Reel>();

    // 1. Index cached reels by shortcode or ID
    for (const r of cached) {
      const key = r.instagramShortcode || r.id;
      map.set(key, r);
    }

    // 2. Merge incoming server reels
    for (const r of incoming) {
      const key = r.instagramShortcode || r.id;
      const existing = map.get(key);
      if (existing) {
        // Merge with preference to latest updatedAt
        const existingTime = new Date(existing.updatedAt || existing.createdAt || 0).getTime();
        const incomingTime = new Date(r.updatedAt || r.createdAt || 0).getTime();
        if (incomingTime >= existingTime) {
          map.set(key, { ...existing, ...r });
        } else {
          map.set(key, { ...r, ...existing });
        }
      } else {
        map.set(key, r);
      }
    }

    // Sort newest first by createdAt
    return Array.from(map.values()).sort((a, b) => {
      const timeA = new Date(a.createdAt || 0).getTime();
      const timeB = new Date(b.createdAt || 0).getTime();
      return timeB - timeA;
    });
  }
};
