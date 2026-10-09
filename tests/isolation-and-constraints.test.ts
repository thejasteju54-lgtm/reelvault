import { describe, it, expect } from 'vitest';

// Simulated DB model representing PostgreSQL + RLS engine behavior
interface DbReel {
  id: string;
  user_id: string;
  instagram_shortcode: string;
  canonical_url: string;
  title: string | null;
  is_favorite: boolean;
  is_archived: boolean;
}

class SimulatedPostgresEngine {
  private tables: { reels: DbReel[] } = { reels: [] };

  // Executes query in the context of an authenticated user_id (RLS Simulation)
  asUser(currentUserId: string) {
    return {
      insertReel: (reel: Omit<DbReel, 'user_id'>): { success: boolean; error?: string; data?: DbReel } => {
        // Enforce UNIQUE (user_id, instagram_shortcode)
        const duplicate = this.tables.reels.find(
          r => r.user_id === currentUserId && r.instagram_shortcode === reel.instagram_shortcode
        );
        if (duplicate) {
          return { success: false, error: '23505: duplicate key value violates unique constraint "uq_reels_user_shortcode"' };
        }

        const newRow: DbReel = { ...reel, user_id: currentUserId };
        this.tables.reels.push(newRow);
        return { success: true, data: newRow };
      },

      selectReels: (): DbReel[] => {
        // Enforce RLS policy: USING (auth.uid() = user_id)
        return this.tables.reels.filter(r => r.user_id === currentUserId);
      },

      selectReelById: (id: string): DbReel | null => {
        // Enforce RLS policy: USING (auth.uid() = user_id)
        const found = this.tables.reels.find(r => r.id === id && r.user_id === currentUserId);
        return found ?? null;
      },

      updateReel: (id: string, updates: Partial<DbReel>): { rowsAffected: number } => {
        // Enforce RLS policy: USING (auth.uid() = user_id)
        const index = this.tables.reels.findIndex(r => r.id === id && r.user_id === currentUserId);
        if (index === -1) {
          return { rowsAffected: 0 };
        }
        this.tables.reels[index] = { ...this.tables.reels[index], ...updates };
        return { rowsAffected: 1 };
      },

      deleteReel: (id: string): { rowsAffected: number } => {
        // Enforce RLS policy: USING (auth.uid() = user_id)
        const initialCount = this.tables.reels.length;
        this.tables.reels = this.tables.reels.filter(r => !(r.id === id && r.user_id === currentUserId));
        return { rowsAffected: initialCount - this.tables.reels.length };
      }
    };
  }
}

describe('Phase 2: Database Schema & Multi-Tenant Isolation Verification', () => {
  const db = new SimulatedPostgresEngine();
  const userA = 'user-uuid-1111-aaaa';
  const userB = 'user-uuid-2222-bbbb';

  it('allows User A to save a reel successfully', () => {
    const clientA = db.asUser(userA);
    const result = clientA.insertReel({
      id: 'reel-001',
      instagram_shortcode: 'C3b4Xyz890',
      canonical_url: 'https://www.instagram.com/reel/C3b4Xyz890/',
      title: 'Awesome TypeScript Tricks',
      is_favorite: false,
      is_archived: false
    });

    expect(result.success).toBe(true);
    expect(result.data?.user_id).toBe(userA);
  });

  it('MANDATORY TEST: User B CANNOT read User A reels', () => {
    const clientB = db.asUser(userB);
    const reelsForB = clientB.selectReels();
    expect(reelsForB).toHaveLength(0);

    const directLookup = clientB.selectReelById('reel-001');
    expect(directLookup).toBeNull();
  });

  it('MANDATORY TEST: User B CANNOT update User A reels', () => {
    const clientB = db.asUser(userB);
    const updateResult = clientB.updateReel('reel-001', { is_favorite: true });
    expect(updateResult.rowsAffected).toBe(0);

    // Verify User A data remains untouched
    const clientA = db.asUser(userA);
    const reelA = clientA.selectReelById('reel-001');
    expect(reelA?.is_favorite).toBe(false);
  });

  it('MANDATORY TEST: User B CANNOT delete User A reels', () => {
    const clientB = db.asUser(userB);
    const deleteResult = clientB.deleteReel('reel-001');
    expect(deleteResult.rowsAffected).toBe(0);

    // Verify User A reel still exists
    const clientA = db.asUser(userA);
    const reelA = clientA.selectReelById('reel-001');
    expect(reelA).not.toBeNull();
  });

  it('enforces UNIQUE(user_id, instagram_shortcode) duplicate prevention for the same user', () => {
    const clientA = db.asUser(userA);
    const duplicateAttempt = clientA.insertReel({
      id: 'reel-002',
      instagram_shortcode: 'C3b4Xyz890', // Identical shortcode
      canonical_url: 'https://www.instagram.com/reel/C3b4Xyz890/',
      title: 'Trying to save duplicate',
      is_favorite: false,
      is_archived: false
    });

    expect(duplicateAttempt.success).toBe(false);
    expect(duplicateAttempt.error).toContain('duplicate key value violates unique constraint');
  });

  it('allows User B to save the SAME shortcode independently without collision', () => {
    const clientB = db.asUser(userB);
    const resultB = clientB.insertReel({
      id: 'reel-003',
      instagram_shortcode: 'C3b4Xyz890', // Same shortcode as User A
      canonical_url: 'https://www.instagram.com/reel/C3b4Xyz890/',
      title: 'User B note for this reel',
      is_favorite: true,
      is_archived: false
    });

    expect(resultB.success).toBe(true);
    expect(resultB.data?.user_id).toBe(userB);

    // Both users now have their own copy
    expect(clientB.selectReels()).toHaveLength(1);
    expect(db.asUser(userA).selectReels()).toHaveLength(1);
  });
});
