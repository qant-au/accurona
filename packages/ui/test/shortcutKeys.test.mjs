// Runs against the build: npm run build first.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { shortcutKeys } from '../dist/shortcutKeys.js';

test('a chord splits into its keys, on either platform', () => {
  assert.deepEqual(shortcutKeys('Ctrl + Shift + Z'), { kind: 'chord', keys: ['Ctrl', 'Shift', 'Z'] });
  assert.deepEqual(shortcutKeys('⌘ ⇧ Z'), { kind: 'chord', keys: ['⌘', '⇧', 'Z'] });
  assert.deepEqual(shortcutKeys('Ctrl + -'), { kind: 'chord', keys: ['Ctrl', '-'] });
  assert.deepEqual(shortcutKeys('V'), { kind: 'chord', keys: ['V'] });
  assert.deepEqual(shortcutKeys('Delete'), { kind: 'chord', keys: ['Delete'] });
  assert.deepEqual(shortcutKeys('Right-click'), { kind: 'chord', keys: ['Right-click'] });
});

test('a phrase stays text, so it can wrap', () => {
  for (const phrase of ['Space + drag, or the hand tool', 'Shift + click', '⌘ + arrow keys', 'Drag on empty canvas']) {
    assert.deepEqual(shortcutKeys(phrase), { kind: 'text', text: phrase });
  }
});
