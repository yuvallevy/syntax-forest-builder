import { IconStrikethrough } from '@tabler/icons-react';

export const currentVersion: string = '0.7.3';

export const changesFromPreviousVersion: (string | JSX.Element)[] = [
  <>Added simple strikethrough functionality.
    Select any part of a sentence and click the <IconStrikethrough
      stroke={1}
      style={{ transform: 'translate(0.5px, 0.5px)', verticalAlign: 'bottom' }}
    /> button on the toolbox to draw a line through it.</>,
];
