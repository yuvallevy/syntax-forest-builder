import { describe, expect, it } from 'vitest';
import { PlotRect, PositionedNode, PositionedTree } from '../../core/types';
import { isNodeInRect } from '../../ui/selection';

describe('node selection', () => {
  const tree: PositionedTree = {
    sentence: 'Noun verbs very adverbly.',
    nodes: {
      'a': { label: 'S', position: { treeX: 53.625, treeY: -80 }, children: ['b'] },
      'b': { label: 'NP', position: { treeX: 18, treeY: -60 }, children: ['c'] },
      'c': { label: 'N', position: { treeX: 18, treeY: -2 } },
      'd': { label: 'VP', position: { treeX: 89.25, treeY: -60 }, children: ['e', 'f'] },
      'e': { label: 'V', position: { treeX: 57, treeY: -2 } },
      'f': { label: 'AdvP', position: { treeX: 121.5, treeY: -30 }, triangle: { treeX1: 72, treeX2: 104 } },
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

  it.each(nodesAndRects)('returns whether a node is in a rectangle %#', (node, rect, expectedResult) => {
    expect(isNodeInRect(rect)(tree)(node)).toBe(expectedResult);
  });
});