import { describe, expect, it } from 'vitest';
import {
  CoordsInPlot, CoordsInTree, idMap, NodeIndicatorInPlot, PlotCoordsOffset, PositionedBranchingNode, PositionedNode,
  PositionedStrandedNode, PositionedTerminalNode, PositionedTree, set, StringSlice, TreeCoordsOffset, TreeXRange,
  UnpositionedPlot, UnpositionedTerminalNode, UnpositionedTree
} from 'npbloom-core';
import { PlotRect } from '../../ui/coords';
import { isNodeInRect, pruneSelection } from '../../ui/selection';

describe('node selection', () => {
  const unpositionedPlot = new UnpositionedPlot(
    idMap({
      'aa': new UnpositionedTree(
        'Noun verbed.',
        idMap({
          'np': new UnpositionedTerminalNode('NP', new TreeCoordsOffset(0, 0), new StringSlice(0, 4)),
          'vp': new UnpositionedTerminalNode('VP', new TreeCoordsOffset(0, 0), new StringSlice(5, 10)),
        }),
        new PlotCoordsOffset(0, 0),
      ),
    }),
  );

  const positionedTree = new PositionedTree(
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

  const nodesAndRects: [PositionedNode, PlotRect, boolean][] = [
    [
      new PositionedStrandedNode('N', new CoordsInTree(18, -2)),
      { topLeft: new CoordsInPlot(64, -47), bottomRight: new CoordsInPlot(78, -37) },
      true,
    ],
    [
      new PositionedStrandedNode('N', new CoordsInTree(18, -2)),
      { topLeft: new CoordsInPlot(68, -47), bottomRight: new CoordsInPlot(78, -37) },
      true,
    ],
    [
      new PositionedStrandedNode('N', new CoordsInTree(18, -2)),
      { topLeft: new CoordsInPlot(64, -47), bottomRight: new CoordsInPlot(68, -37) },
      true,
    ],
    [
      new PositionedStrandedNode('N', new CoordsInTree(18, -2)),
      { topLeft: new CoordsInPlot(54, -47), bottomRight: new CoordsInPlot(58, -37) },
      false,
    ],
    [
      new PositionedStrandedNode('VP', new CoordsInTree(89.25, -60)),
      { topLeft: new CoordsInPlot(64, -47), bottomRight: new CoordsInPlot(78, -37) },
      false,
    ],
  ];

  it('deselects nonexistent trees', () => {
    expect(pruneSelection({ treeId: 'aa', slice: new StringSlice(0, 4) }, unpositionedPlot))
      .toStrictEqual({ treeId: 'aa', slice: new StringSlice(0, 4) });
    expect(pruneSelection({ treeId: 'zz', slice: new StringSlice(0, 4) }, unpositionedPlot))
      .toStrictEqual({ nodeIndicators: [] });
  });

  it('deselects nonexistent nodes', () => {
    expect(pruneSelection({ nodeIndicators: [new NodeIndicatorInPlot('aa', 's'), new NodeIndicatorInPlot('aa', 'vp')] },
      unpositionedPlot)).toStrictEqual({ nodeIndicators: [new NodeIndicatorInPlot('aa', 'vp')] });
  });

  it.each(nodesAndRects)('returns whether a node is in a rectangle %#', (node, rect, expectedResult) => {
    expect(isNodeInRect(rect)(positionedTree)(node)).toBe(expectedResult);
  });
});