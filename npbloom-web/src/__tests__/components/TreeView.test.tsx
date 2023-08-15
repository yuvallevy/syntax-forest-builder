import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import TreeView from '../../components/TreeView';
import {
  CoordsInPlot, CoordsInTree, EntitySet, PositionedBranchingNode, PositionedTerminalNode, PositionedTree, StringSlice,
  TreeXRange
} from 'npbloom-core';

describe('tree rendering', () => {
  const tree = new PositionedTree(
    'nNQGVK0O',
    'Noun verbs very adverbly.',
    EntitySet.of([
      new PositionedBranchingNode('a', 'S', new CoordsInTree(53.625, -80)).withChildrenFromArray(['b', 'd']),
      new PositionedBranchingNode('b', 'NP', new CoordsInTree(18, -60)).withChildrenFromArray(['c']),
      new PositionedTerminalNode('c', 'N', new CoordsInTree(18, -2), new StringSlice(0, 4)),
      new PositionedBranchingNode('d', 'VP', new CoordsInTree(89.25, -60)).withChildrenFromArray(['e', 'f']),
      new PositionedTerminalNode('e', 'V', new CoordsInTree(57, -2), new StringSlice(5, 10)),
      new PositionedTerminalNode('f', 'AdvP', new CoordsInTree(121.5, -30), new StringSlice(11, 24), new TreeXRange(72, 104)),
    ]),
    new CoordsInPlot(50, -32),
    104,
  );

  const treeWithUnlabeledNode = new PositionedTree(
    'lv846',
    'Who was IP?',
    EntitySet.of([
      new PositionedBranchingNode('a', 'CP', new CoordsInTree(37.375, -100)).withChildrenFromArray(['c', 'd']),
      new PositionedBranchingNode('b', 'C\'', new CoordsInTree(59.25, -60)).withChildrenFromArray(['d', 'e']),
      new PositionedTerminalNode('c', '', new CoordsInTree(15.5, -2), new StringSlice(0, 3)),
      new PositionedTerminalNode('d', 'C', new CoordsInTree(47.5, -2), new StringSlice(4, 7)),
      new PositionedTerminalNode('e', 'IP', new CoordsInTree(71, -20), new StringSlice(8, 10), new TreeXRange(64, 78)),
    ]),
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

  it('renders dominated unlabeled nodes without text or gap', () => {
    expect(render(
      <svg>
        <TreeView treeId="tree1" tree={treeWithUnlabeledNode} />
      </svg>
    ).asFragment()).toMatchSnapshot();
  });
});
