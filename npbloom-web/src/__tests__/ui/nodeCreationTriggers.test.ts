import { describe, expect, it } from 'vitest';
import {
  CoordsInPlot, CoordsInTree, idMap, PositionedBranchingNode, PositionedTerminalNode, PositionedTree, set, StringSlice,
  TreeXRange
} from 'npbloom-core';
import { getNodeCreationTriggersForTree } from '../../ui/nodeCreationTriggers';
import mockStrWidth from '../__mocks__/mockStrWidth';

describe('node creation triggers', () => {
  const treeWithNoUnassignedSlices = new PositionedTree(
    'Noun verbs very adverbly.',
    idMap({
      'b': new PositionedBranchingNode('NP', new CoordsInTree(18, -60), set(['c'])),
      'c': new PositionedTerminalNode('N', new CoordsInTree(18, -2), new StringSlice(0, 4)),
      'd': new PositionedBranchingNode('VP', new CoordsInTree(89.25, -60), set(['e', 'f'])),
      'e': new PositionedTerminalNode('V', new CoordsInTree(57, -2), new StringSlice(5, 10)),
      'f': new PositionedTerminalNode('AdvP', new CoordsInTree(121.5, -30), new StringSlice(11, 24), new TreeXRange(72, 104)),
    }),
    new CoordsInPlot(50, -32),
    104,
  );
  const treeWithUnassignedSlices = new PositionedTree(
    'Noun verbs very adverbly.',
    idMap({
      'b': new PositionedBranchingNode('NP', new CoordsInTree(18, -60), set(['c'])),
      'c': new PositionedTerminalNode('N', new CoordsInTree(18, -2), new StringSlice(0, 4)),
      'd': new PositionedBranchingNode('VP', new CoordsInTree(57, -60), set(['e'])),
      'e': new PositionedTerminalNode('V', new CoordsInTree(57, -2), new StringSlice(5, 10)),
    }),
    new CoordsInPlot(50, -32),
    104,
  );

  it('generates node creation triggers for a tree with all slices assigned', () => {
    expect(getNodeCreationTriggersForTree(mockStrWidth)(treeWithNoUnassignedSlices)).toMatchSnapshot();
  });

  it('generates node creation triggers for a tree with unassigned slices', () => {
    expect(getNodeCreationTriggersForTree(mockStrWidth)(treeWithUnassignedSlices)).toMatchSnapshot();
  });
});
