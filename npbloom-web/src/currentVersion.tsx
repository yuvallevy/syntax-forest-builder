export const currentVersion: string = '0.8';

export const changesFromPreviousVersion: (string | JSX.Element)[] = [
  'Added a new "Shapes" feature, allowing users to draw simple shapes on the canvas to annotate their trees.',
  <>
    Added an option to import and export entire forests as files, allowing users to transfer their work between different devices and share it with others.<br />
    Select <b>Import forest...</b> and <b>Export forest...</b> from the File menu to use this feature.
  </>,
  <>
    Added an option to export a single tree as a PNG file.<br />
    Select <b>Export tree as image...</b> from the File menu to use this feature.
  </>,
  'Minor improvements to performance, graphics, and UX.',
];
