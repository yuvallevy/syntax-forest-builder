import { render } from '@testing-library/react';
import { PositionedTree } from '../../core/types';
import TreeView from '../../ui/TreeView';

describe('tree rendering', () => {
  const tree: PositionedTree = {
    sentence: 'Noun verbs very adverbly.',
    nodes: {
      'a': { label: 'S', position: { treeX: 53.625, treeY: -80 }, children: {
        'b': { label: 'NP', position: { treeX: 18, treeY: -60 }, children: {
          'c': { label: 'N', position: { treeX: 18, treeY: -2 } },
        } },
        'd': { label: 'VP', position: { treeX: 89.25, treeY: -60 }, children: {
          'e': { label: 'V', position: { treeX: 57, treeY: -2 } },
          'f': { label: 'AdvP', position: { treeX: 121.5, treeY: -30 }, triangle: { treeX1: 72, treeX2: 104 } },
        } },
      } },
    },
    position: { plotX: 50, plotY: -32 },
    width: 104,
  };

  it('renders a tree with position-assigned nodes', () => {
    expect(render(
      <svg>  {/** Render inside an SVG tag to prevent "unrecognized tag" errors in console */}
        <TreeView treeId="tree1" tree={tree} selectedNodeIds={[]} />
      </svg>
    ).asFragment()).toMatchSnapshot();
  });

  it('renders a tree with position-assigned nodes where some are selected', () => {
    expect(render(
      <svg>
        <TreeView treeId="tree1" tree={tree} selectedNodeIds={['b', 'f']} />
      </svg>
    ).asFragment()).toMatchSnapshot();
  });
});
