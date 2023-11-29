import { OS } from '@mantine/hooks';

// How certain keys are rendered on each operating system, with modifier keys in their canonical order
const keyRenderings: Map<OS, [string, string][]> = new Map([
  ['windows', [
    ['Ctrl-', 'Ctrl+'],
    ['Alt-', 'Alt+'],
    ['Shift-', 'Shift+'],
    ['Up', '\u2191'],
  ]],
  ['macos', [
    ['Alt-', '\u2325'],
    ['Shift-', '\u21e7'],
    ['Ctrl-', '\u2318'],  // Cmd used on macOS, hence last
    ['Up', '\u2191'],
    ['Alt', '\u2325'],  // when not modifying another key
    ['Enter', '\u23ce'],
    ['Backspace', '\u232b'],
  ]],
]);

const substituteOsAwareHotkey = (hotkey: string, os: OS): string => {
  const prettyKeys = keyRenderings.get(os);
  if (!prettyKeys) return hotkey;
  return prettyKeys.reduceRight((hotkeyWithBareKeys, [bareKey, prettyKey]) =>
      hotkeyWithBareKeys.includes(bareKey)
        ? prettyKey + hotkeyWithBareKeys.replace(bareKey, '')
        : hotkeyWithBareKeys,
    hotkey);
};

export default substituteOsAwareHotkey;
