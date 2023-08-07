import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import TreeView from '../../../ui/components/TreeView';
import {
  CoordsInPlot, CoordsInTree, idMap, PositionedBranchingNode, PositionedTerminalNode, PositionedTree, set, StringSlice,
  TreeXRange
} from 'npbloom-core';

describe('tree rendering', () => {
  const tree = new PositionedTree(
    'Noun verbs very adverbly.',
    idMap({
      'a': new PositionedBranchingNode('S', new CoordsInTree(53.625, -80), set(['b', 'd'])),
      'b': new PositionedBranchingNode('NP', new CoordsInTree(18, -60), set(['c'])),
      'c': new PositionedTerminalNode('N', new CoordsInTree(18, -2), new StringSlice(0, 4)),
      'd': new PositionedBranchingNode('VP', new CoordsInTree(89.25, -60), set(['e', 'f'])),
      'e': new PositionedTerminalNode('V', new CoordsInTree(57, -2), new StringSlice(5, 10)),
      'f': new PositionedTerminalNode('AdvP', new CoordsInTree(121.5, -30), new StringSlice(11, 24), new TreeXRange(72, 104)),
    }),
    new CoordsInPlot(50, -32),
    104,
  );

  const treeWithUnlabeledNode = new PositionedTree(
    'Who was IP?',
    idMap({
      'a': new PositionedBranchingNode('CP', new CoordsInTree(37.375, -100), set(['c', 'd'])),
      'b': new PositionedBranchingNode('C\'', new CoordsInTree(59.25, -60), set(['d', 'e'])),
      'c': new PositionedTerminalNode('', new CoordsInTree(15.5, -2), new StringSlice(0, 3)),
      'd': new PositionedTerminalNode('C', new CoordsInTree(47.5, -2), new StringSlice(4, 7)),
      'e': new PositionedTerminalNode('IP', new CoordsInTree(71, -20), new StringSlice(8, 10), new TreeXRange(64, 78)),
    }),
    new CoordsInPlot(283, 238),
    86,
  );

  it('renders a tree with position-assigned nodes', () => {
    expect(render(
      <svg>  {/** Render inside an SVG tag to prevent "unrecognized tag" errors in console */}
        <TreeView treeId="tree1" tree={tree} />
      </svg>
    ).asFragment()).toMatchSnapshot();
  });

  it.skip('renders a tree with position-assigned nodes where some are selected', () => {
    expect(render(
      <svg>
        <TreeView treeId="tree1" tree={tree} selectedNodeIds={['b', 'f']} />
      </svg>
    ).asFragment()).toMatchSnapshot();
  });

  it('renders dominated unlabeled nodes without text or gap', () => {
    expect(render(
      <svg>
        <TreeView treeId="tree1" tree={treeWithUnlabeledNode} />
      </svg>
    ).asFragment()).toMatchSnapshot();
  });
});
