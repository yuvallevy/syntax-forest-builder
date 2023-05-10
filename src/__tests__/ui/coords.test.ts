import { describe, expect, it } from 'vitest';
import { calculateNodeCenterOnPlot } from '../../ui/coords';
import { PlotCoords, PositionedNode, PositionedTree } from '../../core/types';

describe('node coordinate functions', () => {
  const tree: PositionedTree = {
    sentence: 'Noun verbs very adverbly.',
    nodes: {
      'a': { label: 'S', position: { treeX: 53.625, treeY: -80 }, children: ['b'] },
      'b': { label: 'NP', position: { treeX: 18, treeY: -60 }, children: ['c'] },
      'c': { label: 'N', position: { treeX: 18, treeY: -2 }, slice: [0, 4] },
      'd': { label: 'VP', position: { treeX: 89.25, treeY: -60 }, children: ['e', 'f'] },
      'e': { label: 'V', position: { treeX: 57, treeY: -2 }, slice: [5, 10] },
      'f': { label: 'AdvP', position: { treeX: 121.5, treeY: -30 }, triangle: { treeX1: 72, treeX2: 104 }, slice: [11, 24] },
    },
    position: { plotX: 50, plotY: -32 },
    width: 104,
  };

  const nodesAndPlotPositions: [PositionedNode, PlotCoords][] = [
    [
      { label: 'N', position: { treeX: 18, treeY: -2 } },
      { plotX: 68, plotY: -43 },
    ],
    [
      { label: 'VP', position: { treeX: 89.25, treeY: -60 } },
      { plotX: 139.25, plotY: -101 },
    ],
  ];

  it.each(nodesAndPlotPositions)('returns the plot-level position of a node', (node, expectedResult) => {
    expect(calculateNodeCenterOnPlot(tree)(node)).toStrictEqual(expectedResult);
  });
});