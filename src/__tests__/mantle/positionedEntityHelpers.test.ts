import { IdMap, PlotCoords, PlotRect, PositionedNode, PositionedTree } from '../../core/types';
import {
  calculateNodePositionOnPlot,
  filterPositionedNodesInTree,
  filterPositionedNodesInTreeById,
  isNodeInRect,
} from '../../mantle/positionedEntityHelpers';

describe('positioned tree/node functions', () => {
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

  const predicates: [(node: PositionedNode) => boolean, IdMap<PositionedNode>][] = [
    [
      (node: PositionedNode) => 'triangle' in node && node.triangle !== undefined,
      {
        'f': { label: 'AdvP', position: { treeX: 121.5, treeY: -30 }, triangle: { treeX1: 72, treeX2: 104 } },
      },
    ],
    [
      (node: PositionedNode) => /^\w+P$/.test(node.label),
      {
        'b': { label: 'NP', position: { treeX: 18, treeY: -60 }, children: {
          'c': { label: 'N', position: { treeX: 18, treeY: -2 } },
        } },
        'd': { label: 'VP', position: { treeX: 89.25, treeY: -60 }, children: {
          'e': { label: 'V', position: { treeX: 57, treeY: -2 } },
          'f': { label: 'AdvP', position: { treeX: 121.5, treeY: -30 }, triangle: { treeX1: 72, treeX2: 104 } },
        } },
        'f': { label: 'AdvP', position: { treeX: 121.5, treeY: -30 }, triangle: { treeX1: 72, treeX2: 104 } },
      },
    ],
  ]

  it.each(predicates)('filters nodes by arbitrary predicates %#', (predicate, expectedFilteredNodes) => {
    expect(filterPositionedNodesInTree(predicate)(tree)).toStrictEqual(expectedFilteredNodes);
  });

  it('filters nodes by IDs', () => {
    expect(filterPositionedNodesInTreeById(['a', 'e'])(tree)).toStrictEqual({
      'a': tree.nodes['a'],
      'e': { label: 'V', position: { treeX: 57, treeY: -2 } },
    });
  });

  const nodesAndPlotPositions: [PositionedNode, PlotCoords][] = [
    [
      { label: 'N', position: { treeX: 18, treeY: -2 } },
      { plotX: 68, plotY: -34 },
    ],
    [
      { label: 'VP', position: { treeX: 89.25, treeY: -60 } },
      { plotX: 139.25, plotY: -92 },
    ],
  ];

  it.each(nodesAndPlotPositions)('returns the plot-level position of a node', (node, expectedResult) => {
    expect(calculateNodePositionOnPlot(tree)(node)).toStrictEqual(expectedResult);
  });

  const nodesAndRects: [PositionedNode, PlotRect, boolean][] = [
    [
      { label: 'N', position: { treeX: 18, treeY: -2 } },
      { topLeft: { plotX: 64, plotY: -38 }, bottomRight: { plotX: 78, plotY: -28 } },
      true,
    ],
    [
      { label: 'N', position: { treeX: 18, treeY: -2 } },
      { topLeft: { plotX: 68, plotY: -38 }, bottomRight: { plotX: 78, plotY: -28 } },
      true,
    ],
    [
      { label: 'N', position: { treeX: 18, treeY: -2 } },
      { topLeft: { plotX: 64, plotY: -38 }, bottomRight: { plotX: 68, plotY: -28 } },
      true,
    ],
    [
      { label: 'N', position: { treeX: 18, treeY: -2 } },
      { topLeft: { plotX: 54, plotY: -38 }, bottomRight: { plotX: 58, plotY: -28 } },
      false,
    ],
    [
      { label: 'VP', position: { treeX: 89.25, treeY: -60 } },
      { topLeft: { plotX: 64, plotY: -38 }, bottomRight: { plotX: 78, plotY: -28 } },
      false,
    ],
  ];

  it.each(nodesAndRects)('returns whether a node is in a rectangle %#', (node, rect, expectedResult) => {
    expect(isNodeInRect(rect)(tree)(node)).toBe(expectedResult);
  });
});
