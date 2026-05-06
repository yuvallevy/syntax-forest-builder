import { IconFileExport, IconFileImport, IconPhoto } from '@tabler/icons-react';

export const currentVersion: string = '0.8';

export const changesFromPreviousVersion: (string | JSX.Element)[] = [
  'Added a new "Shapes" feature, allowing users to draw simple shapes on the canvas to annotate their trees.',
  <>
    Added an option to import and export entire forests as files, allowing users to transfer their work between different devices and share it with others.<br />
    Select <IconFileImport className="menu-icon" /> <b>Import forest...</b> and <IconFileExport className="menu-icon" /> <b>Export forest...</b> from the File menu to use this feature.
  </>,
  <>
    Added an option to export a single tree as a PNG file.<br />
    To use this feature, select one tree, then select <IconPhoto className="menu-icon" /> <b>Export tree as image...</b> from the File menu or click <IconPhoto className="toolbox-icon" /> on the toolbox.
  </>,
  'Minor improvements to performance, graphics, and UX.',
];
