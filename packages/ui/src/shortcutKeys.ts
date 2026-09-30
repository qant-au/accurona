// How one entry of a `?` dialog row reads. An entry is one way to trigger
// the action, as @accurona/core formats it: a chord ("Ctrl + Shift + Z",
// or "⌘ ⇧ Z" on macOS) or, for gestures and key groups, a phrase
// ("Space + drag, or the hand tool"). A chord is drawn as keys joined by
// +; a phrase is text, so it can wrap.
export type ShortcutKeys = { kind: 'chord'; keys: string[] } | { kind: 'text'; text: string };

// A phrase has punctuation or a lowercase word in it ("drag", "keys");
// key names are capitalised or symbols.
const isPhrase = (entry: string): boolean => /[,;]/.test(entry) || /(^|\s)[a-z]{2,}(\s|$)/.test(entry);

export const shortcutKeys = (entry: string): ShortcutKeys => {
  if (isPhrase(entry)) return { kind: 'text', text: entry };
  const keys = entry.includes(' + ') ? entry.split(' + ') : entry.split(' ');
  return { kind: 'chord', keys: keys.filter((key) => key !== '') };
};
