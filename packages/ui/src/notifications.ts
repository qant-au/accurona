import type { ReactNode } from 'react';

// Transient messages ("Saved", "Wall drawing mode"). A module-level store, so
// plain classes outside React can raise one; <NotificationHost /> shows them.

export type Severity = 'info' | 'success' | 'warning' | 'error';

export interface NotifyOptions {
  message: ReactNode;
  title?: ReactNode;
  severity?: Severity;
  icon?: ReactNode;
  // Milliseconds before it goes by itself; false keeps it until closed.
  autoHide?: number | false;
}

export interface Notification extends NotifyOptions {
  id: number;
  severity: Severity;
}

const AUTO_HIDE_MS = 4000;

let items: readonly Notification[] = [];
let nextId = 1;
const timers = new Map<number, ReturnType<typeof setTimeout>>();
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((l) => l());

export function notify(options: NotifyOptions): number {
  const id = nextId++;
  items = [...items, { ...options, id, severity: options.severity ?? 'info' }];
  const autoHide = options.autoHide ?? AUTO_HIDE_MS;
  if (autoHide !== false) {
    timers.set(
      id,
      setTimeout(() => dismissNotification(id), autoHide)
    );
  }
  emit();
  return id;
}

export function dismissNotification(id: number): void {
  clearTimeout(timers.get(id));
  timers.delete(id);
  if (!items.some((n) => n.id === id)) return;
  items = items.filter((n) => n.id !== id);
  emit();
}

export function clearNotifications(): void {
  timers.forEach((t) => clearTimeout(t));
  timers.clear();
  if (items.length === 0) return;
  items = [];
  emit();
}

export function getNotifications(): readonly Notification[] {
  return items;
}

export function subscribeNotifications(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
