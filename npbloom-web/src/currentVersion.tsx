import type { OS } from '@mantine/hooks';
import substituteOsAwareHotkey from './components/substituteOsAwareHotkey.ts';

export const currentVersion: string = '0.7.5';

const os: OS = (() => {
  const platform = window.navigator.platform.toLowerCase();
  if (platform.includes('win')) return 'windows';
  if (platform.includes('mac')) return 'macos';
  if (platform.includes('linux')) return 'linux';
  if (/windows/.test(navigator.userAgent.toLowerCase())) return 'windows';
  if (/macos|mac os|macintosh/.test(navigator.userAgent.toLowerCase())) return 'macos';
  if (/linux/.test(navigator.userAgent.toLowerCase())) return 'linux';
  if (/android/.test(navigator.userAgent.toLowerCase())) return 'android';
  if (/iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase())) return 'ios';
  return 'undetermined';
})();

export const changesFromPreviousVersion: (string | JSX.Element)[] = [
  <>
    Added ability to fold/unfold nodes through new options in the menu and new keyboard shortcuts
    ({substituteOsAwareHotkey('Ctrl--', os)} and {substituteOsAwareHotkey('Ctrl-=', os)}).<br />
    This is useful for large trees where irrelevant parts of the tree need to be temporarily hidden.
  </>,
];
