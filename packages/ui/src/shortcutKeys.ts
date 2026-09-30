// How one entry of a `?` dialog row reads. An entry is one way to trigger
// the action, as @accurona/core formats it: a chord ("Ctrl + Shift + Z",
// or "⌘ ⇧ Z" on macOS), or a gesture whose keys and pointer actions are
// capitalised and anything after them lowercase ("⇧ + Click", "Drag on
// empty canvas", "the hand tool"). A chord is keys joined by +; a gesture
// is its keys, drawn as keys, and its words, drawn as text. An older
// phrase with punctuation in it ("Space + drag, or the hand tool") stays
// text, so it can wrap.
export type ShortcutPart = { key: string } | { text: string };

export type ShortcutKeys =
  | { kind: 'chord'; keys: string[] }
  | { kind: 'gesture'; parts: ShortcutPart[][] }
  | { kind: 'text'; text: string };

// A key or pointer action: a symbol, a digit, or a capitalised word
// ("Shift", "F10", "Right-click"), or "Arrow keys".
const isKeyName = (word: string): boolean => /^([^a-z\s]|[A-Z0-9][\w-]*)$/.test(word);

// One +-joined part: a key, a key then words about it ("Drag on empty
// canvas"), or words alone ("the hand tool").
const readPart = (part: string): ShortcutPart[] => {
  const space = part.indexOf(' ');
  const head = space === -1 ? part : part.slice(0, space);
  if (!isKeyName(head)) return [{ text: part }];
  const tail = space === -1 ? '' : part.slice(space + 1);
  if (tail.startsWith('keys') && head === 'Arrow') {
    const rest = tail.slice('keys'.length).trim();
    return rest ? [{ key: 'Arrow keys' }, { text: rest }] : [{ key: 'Arrow keys' }];
  }
  return tail ? [{ key: head }, { text: tail }] : [{ key: head }];
};

export const shortcutKeys = (entry: string): ShortcutKeys => {
  if (/[;]/.test(entry) || /,\s/.test(entry)) return { kind: 'text', text: entry };
  const chunks = entry.includes(' + ')
    ? entry.split(' + ')
    : entry.split(' ').every(isKeyName)
      ? entry.split(' ')
      : [entry];
  const parts = chunks.filter((chunk) => chunk !== '').map(readPart);
  if (parts.every((p) => p.length === 1 && 'key' in p[0])) {
    return { kind: 'chord', keys: parts.map((p) => (p[0] as { key: string }).key) };
  }
  if (parts.length === 1 && parts[0].length === 1 && 'text' in parts[0][0]) {
    return { kind: 'text', text: entry };
  }
  return { kind: 'gesture', parts };
};

const isMacLike = (): boolean => {
  const nav = (globalThis as { navigator?: { platform?: string; userAgent?: string } }).navigator;
  return /Mac|iPhone|iPad|iPod/.test(`${nav?.platform ?? ''} ${nav?.userAgent ?? ''}`);
};

// `{mod}`, `{shift}` and `{alt}` left in a difference, as the platform names
// them (the keymap's own formatDifferences does this; this catches a list
// passed as it is).
export const keyNames = (text: string, mac = isMacLike()): string =>
  text
    .split('{mod}')
    .join(mac ? '⌘' : 'Ctrl')
    .split('{shift}')
    .join(mac ? '⇧' : 'Shift')
    .split('{alt}')
    .join(mac ? '⌥' : 'Alt');
