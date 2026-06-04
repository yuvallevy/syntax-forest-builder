import {
  IconClick,
} from '@tabler/icons-react';
import ternaryNodeCreationExample from './components/meta/ternary-node-creation.png';

export const currentVersion: string = '0.8.1';

export const releaseDate: string = new Date(2026, 5, 3).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

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
    icon: IconClick,
    title: 'Node creation UX',
    badge: 'Improved',
    description: <>
      <div>
        Fixed usability issues in node creation and added the ability to quickly add a parent node for all selected nodes.<br />
        This is useful for ditransitive verbs in some syntax models:
      </div>
      <img
        src={ternaryNodeCreationExample}
        alt="Example of creating a parent node for three selected nodes"
        style={{ maxWidth: '25ch' }}
      />
    </>
  }
];
