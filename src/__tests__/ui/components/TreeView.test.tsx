import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import TreeView from '../../../ui/components/TreeView';
import { PositionedTree } from '../../../content/positioned/types';

describe('tree rendering', () => {
  const tree: PositionedTree = {
    sentence: 'Noun verbs very adverbly.',
    nodes: {
      'a': { label: 'S', position: { treeX: 53.625, treeY: -80 }, children: ['b', 'd'] },
      'b': { label: 'NP', position: { treeX: 18, treeY: -60 }, children: ['c'] },
      'c': { label: 'N', position: { treeX: 18, treeY: -2 }, slice: [0, 4] },
      'd': { label: 'VP', position: { treeX: 89.25, treeY: -60 }, children: ['e', 'f'] },
      'e': { label: 'V', position: { treeX: 57, treeY: -2 }, slice: [5, 10] },
      'f': { label: 'AdvP', position: { treeX: 121.5, treeY: -30 }, triangle: { treeX1: 72, treeX2: 104 }, slice: [11, 24] },
    },
    position: { plotX: 50, plotY: -32 },
    width: 104,
  };

  const treeWithUnlabeledNode: PositionedTree = {
    nodes: {
      'a': { label: 'CP', children: ['c', 'd'], position: { treeX: 37.375, treeY: -100 } },
      'b': { label: 'C\'', children: ['d', 'e'], position: { treeX: 59.25, treeY: -60 } },
      'c': { label: '', slice: [0, 3], position: { treeX: 15.5, treeY: -2 } },
      'd': { label: 'C', slice: [4, 7], position: { treeX: 47.5, treeY: -2 } },
      'e': { label: 'IP', slice: [8, 10], triangle: { treeX1: 64, treeX2: 78 }, position: { treeX: 71, treeY: -20 } },
    },
    sentence: 'Who was IP?',
    position: { plotX: 283, plotY: 238 },
    width: 86,
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

  it('renders dominated unlabeled nodes without text or gap', () => {
    expect(render(
      <svg>
        <TreeView treeId="tree1" tree={treeWithUnlabeledNode} selectedNodeIds={[]} />
      </svg>
    ).asFragment()).toMatchSnapshot();
  });
});
