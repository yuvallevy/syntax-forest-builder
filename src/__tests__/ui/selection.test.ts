import { describe, expect, it } from 'vitest';
import { PlotRect } from '../../ui/coords';
import { isNodeInRect, pruneSelection } from '../../ui/selection';
import { PositionedNode, PositionedTree } from '../../content/positioned/types';
import { UnpositionedPlot } from '../../content/unpositioned/types';

describe('node selection', () => {
  const unpositionedPlot: UnpositionedPlot = {
    trees: {
      'aa': {
        sentence: 'Noun verbed.',
        nodes: {
          'np': { label: 'NP', offset: { dTreeX: 0, dTreeY: 0 }, slice: [0, 4] },
          'vp': { label: 'VP', offset: { dTreeX: 0, dTreeY: 0 }, slice: [5, 10] },
        },
        offset: { dPlotX: 0, dPlotY: 0 },
      },
    },
  };

  const positionedTree: PositionedTree = {
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

  const nodesAndRects: [PositionedNode, PlotRect, boolean][] = [
    [
      { label: 'N', position: { treeX: 18, treeY: -2 } },
      { topLeft: { plotX: 64, plotY: -47 }, bottomRight: { plotX: 78, plotY: -37 } },
      true,
    ],
    [
      { label: 'N', position: { treeX: 18, treeY: -2 } },
      { topLeft: { plotX: 68, plotY: -47 }, bottomRight: { plotX: 78, plotY: -37 } },
      true,
    ],
    [
      { label: 'N', position: { treeX: 18, treeY: -2 } },
      { topLeft: { plotX: 64, plotY: -47 }, bottomRight: { plotX: 68, plotY: -37 } },
      true,
    ],
    [
      { label: 'N', position: { treeX: 18, treeY: -2 } },
      { topLeft: { plotX: 54, plotY: -47 }, bottomRight: { plotX: 58, plotY: -37 } },
      false,
    ],
    [
      { label: 'VP', position: { treeX: 89.25, treeY: -60 } },
      { topLeft: { plotX: 64, plotY: -47 }, bottomRight: { plotX: 78, plotY: -37 } },
      false,
    ],
  ];

  it('deselects nonexistent trees', () => {
    expect(pruneSelection({ treeId: 'aa', slice: [0, 4] }, unpositionedPlot))
      .toStrictEqual({ treeId: 'aa', slice: [0, 4] });
    expect(pruneSelection({ treeId: 'zz', slice: [0, 4] }, unpositionedPlot))
      .toStrictEqual({ nodeIndicators: [] });
  });

  it('deselects nonexistent nodes', () => {
    expect(pruneSelection({ nodeIndicators: [{ treeId: 'aa', nodeId: 's' }, { treeId: 'aa', nodeId: 'vp' }] },
      unpositionedPlot)).toStrictEqual({ nodeIndicators: [{ treeId: 'aa', nodeId: 'vp' }] });
  });

  it.each(nodesAndRects)('returns whether a node is in a rectangle %#', (node, rect, expectedResult) => {
    expect(isNodeInRect(rect)(positionedTree)(node)).toBe(expectedResult);
  });
});