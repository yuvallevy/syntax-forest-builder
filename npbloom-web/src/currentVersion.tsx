import {
  IconActivity,
  IconCircleSquare,
  IconFileExport,
  IconFileImport,
  IconPhoto,
  IconPhotoShare,
  IconShare2,
} from '@tabler/icons-react';

export const currentVersion: string = '0.8';

export const releaseDate: string = new Date(2026, 4, 6)
  .toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

type ChangeBadge = 'New' | 'Improved' | 'Fix';

type Change = { icon: (...args: any[]) => JSX.Element; title: string; badge?: ChangeBadge; description: string | JSX.Element; };

// For each item in this list, try to keep the description concise (1-2 sentences) and avoid technical jargon,
// since it will be shown to users who may not be familiar with the internal workings of the app.
export const changesFromPreviousVersion: Change[] = [
  {
    icon: IconCircleSquare,
    title: 'Shapes',
    badge: 'New',
    description: 'Draw simple shapes directly on the canvas to annotate and mark up your trees.',
  },
  {
    icon: IconShare2,
    title: 'Forest import & export',
    badge: 'New',
    description: <>
      Transfer entire forests between devices or share them with colleagues or students using the new{' '}
      <IconFileExport className="menu-icon" /> <b>Export forest...</b> and <IconFileImport className="menu-icon" /> <b>Import forest...</b> options in the File menu.
    </>,
  },
  {
    icon: IconPhoto,
    title: 'Export tree as image',
    badge: 'New',
    description: <>
      Export a single tree as a PNG file.{' '}
      Select a tree, then select <IconPhotoShare className="menu-icon" /> <b>Export tree as image...</b> from the File menu or click <IconPhotoShare className="toolbox-icon" /> on the toolbox.
    </>,
  },
  {
    icon: IconActivity,
    title: 'Performance & UX',
    badge: 'Improved',
    description: 'Minor improvements to rendering performance, graphics quality, and general usability.',
  },
];
