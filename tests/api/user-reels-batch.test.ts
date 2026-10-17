import test from 'node:test';
import assert from 'node:assert/strict';
import { parseInstagramUrl } from '../../src/server/utils/instagram.js';
import { saveReel, getReels, syncReels } from '../../src/server/services/reels.service.js';
import { registerUser } from '../../src/server/services/auth.service.js';

test('User Reels Batch Saving & Media Validation Loop', async () => {
  const testUser = registerUser(`batch_test_${Date.now()}@reelvault.app`, 'StrongPassword123!');
  const userId = testUser.user.id;

  const userUrls = [
    'https://www.instagram.com/reel/Dec2VWlJdWQ/?xtok=NGVjODh0cDlzZXRr',
    'https://www.instagram.com/reel/DedhO_BIakB/?exln=OTFoNzN4NzZ0aWli',
    'https://www.instagram.com/reel/DedMdBixhZd/?xtok=b2pnaTZ4b2Nya2Rk',
    'https://www.instagram.com/reel/Db0sHtNSwsR/?dlrf=MWtqbngyb3lhZnpzeg=='
  ];

  const savedReels = [];

  // 1. Save each reel one by one sequentially
  for (const url of userUrls) {
    const parsed = parseInstagramUrl(url);
    assert.ok(parsed.isValid, `URL should be valid: ${url}`);
    assert.ok(parsed.shortcode, `Shortcode must be extracted: ${url}`);

    const reel = saveReel(userId, { url });
    assert.ok(reel.id, 'Reel must have an ID');
    assert.equal(reel.instagramShortcode, parsed.shortcode);
    assert.ok(reel.thumbnailUrl, 'Reel must have an auto-populated thumbnail URL');
    assert.ok(reel.thumbnailUrl.includes(parsed.shortcode), 'Thumbnail URL must reference shortcode');
    savedReels.push(reel);
  }

  // 2. Verify all 4 reels exist and none disappeared
  const fetched = getReels(userId, { limit: 10 });
  assert.equal(fetched.reels.length, 4, 'All 4 reels must be preserved in the vault');
  assert.equal(fetched.total, 4, 'Total vault count must be exactly 4');

  const shortcodes = fetched.reels.map(r => r.instagramShortcode);
  assert.ok(shortcodes.includes('Dec2VWlJdWQ'));
  assert.ok(shortcodes.includes('DedhO_BIakB'));
  assert.ok(shortcodes.includes('DedMdBixhZd'));
  assert.ok(shortcodes.includes('Db0sHtNSwsR'));

  // 3. Test syncReels (simulating cold serverless hydration from client cache)
  const rehydrated = syncReels(userId, savedReels);
  assert.equal(rehydrated.length, 4, 'Sync must retain all 4 reels without data loss');
});
