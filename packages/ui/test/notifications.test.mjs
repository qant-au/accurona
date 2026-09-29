// Runs against the build: npm run build first.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  clearNotifications,
  dismissNotification,
  getNotifications,
  notify,
  subscribeNotifications
} from '../dist/notifications.js';

test('notify adds, dismiss and clear remove, listeners hear each change', () => {
  let heard = 0;
  const off = subscribeNotifications(() => heard++);
  const a = notify({ message: 'Saved', severity: 'success' });
  const b = notify({ title: 'Hint', message: 'Draw walls' });
  assert.deepEqual(
    getNotifications().map((n) => [n.id, n.severity]),
    [
      [a, 'success'],
      [b, 'info']
    ]
  );
  dismissNotification(a);
  assert.deepEqual(
    getNotifications().map((n) => n.id),
    [b]
  );
  clearNotifications();
  assert.equal(getNotifications().length, 0);
  assert.equal(heard, 4);
  off();
  notify({ message: 'unheard', autoHide: false });
  assert.equal(heard, 4);
  clearNotifications();
});

test('a notification hides itself after autoHide ms', async () => {
  notify({ message: 'brief', autoHide: 5 });
  assert.equal(getNotifications().length, 1);
  await new Promise((r) => setTimeout(r, 20));
  assert.equal(getNotifications().length, 0);
});

test('the store keeps its identity between changes, for useSyncExternalStore', () => {
  const before = getNotifications();
  assert.equal(getNotifications(), before);
  notify({ message: 'x', autoHide: false });
  assert.notEqual(getNotifications(), before);
  clearNotifications();
});
