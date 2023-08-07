import { describe, expect, it } from 'vitest';
import { calculateNodeCenterOnPlot } from '../../ui/coords';
import {
  CoordsInPlot, CoordsInTree, idMap, PositionedBranchingNode, PositionedNode, PositionedStrandedNode,
  PositionedTerminalNode, PositionedTree, set, StringSlice, TreeXRange
} from 'npbloom-core';

describe('node coordinate functions', () => {
  const tree = new PositionedTree(
    'Noun verbs very adverbly.',
    idMap({
      'a': new PositionedBranchingNode('S', new CoordsInTree(53.625, -80), set(['b'])),
      'b': new PositionedBranchingNode('NP', new CoordsInTree(18, -60), set(['c'])),
      'c': new PositionedTerminalNode('N', new CoordsInTree(18, -2), new StringSlice(0, 4)),
      'd': new PositionedBranchingNode('VP', new CoordsInTree(89.25, -60), set(['e', 'f'])),
      'e': new PositionedTerminalNode('V', new CoordsInTree(57, -2), new StringSlice(5, 10)),
      'f': new PositionedTerminalNode('AdvP', new CoordsInTree(121.5, -30), new StringSlice(11, 24), new TreeXRange(72, 104)),
    }),
    new CoordsInPlot(50, -32),
    104,
  );

  const nodesAndPlotPositions: [PositionedNode, CoordsInPlot][] = [
    [
      new PositionedStrandedNode('N', new CoordsInTree(18, -2)),
      new CoordsInPlot(68, -43),
    ],
    [
      new PositionedStrandedNode('VP', new CoordsInTree(89.25, -60)),
      new CoordsInPlot(139.25, -101),
    ],
  ];

  it.each(nodesAndPlotPositions)('returns the plot-level position of a node', (node, expectedResult) => {
    expect(calculateNodeCenterOnPlot(tree)(node)).toStrictEqual(expectedResult);
  });
});