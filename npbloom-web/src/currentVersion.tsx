import { IconAdjustmentsHorizontal, IconLifebuoy, IconRulerMeasure } from '@tabler/icons-react';

export const currentVersion: string = '0.8.2';

export const releaseDate: string = new Date(2026, 5, 10).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

type ChangeBadge = 'New' | 'Improved' | 'Fix';

type Change = { icon: (...args: any[]) => JSX.Element; title: string; badge?: ChangeBadge; description: string | JSX.Element; };

// For each item in this list, try to keep the description concise (1-2 sentences) and avoid technical jargon,
// since it will be shown to users who may not be familiar with the internal workings of the app.
export const changesFromPreviousVersion: Change[] = [
//   {
//     icon: IconExample1,
//     title: 'Brief title',
//     badge: 'New/Improved/Fix',
//     description: 'More detailed description of the change as plain text.',
//   },
//   {
//     icon: IconExample2,
//     title: 'Another change',
//     badge: 'New/Improved/Fix',
//     description: <>
//       More detailed description of the change, which can include <IconExample2 className="menu-icon" /> <b>menu icons</b> or <IconExample2 className="toolbox-icon" /> toolbox icons.
//     </>,
//   },
  {
    icon: IconLifebuoy,
    title: 'Guided tour',
    badge: 'New',
    description: <>
      The old demo feature has been replaced with an animated tour that teaches users how to use the app.
      The tour is accessible from the welcome message when the app is first loaded.
    </>,
  },
  {
    icon: IconRulerMeasure,
    title: 'Text width measurement',
    badge: 'Improved',
    description: <>
      The old method of estimating text width has been retired.
      The new method introduced in v0.5 as "experimental" is now the default.<br />
      This fixes some bugs with sentences being cut off and terminal nodes being misplaced.<br />
      Use the <IconAdjustmentsHorizontal className="toolbox-icon" /> <b>Settings</b> menu to switch back to the old method.
    </>,
  },
];
