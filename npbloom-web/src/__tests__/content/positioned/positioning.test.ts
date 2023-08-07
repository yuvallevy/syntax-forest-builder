import { describe, expect, it } from 'vitest';
import {
  applyNodePositionsToTree, CoordsInTree, idMap, PlotCoordsOffset, PositionedTerminalNode, set, sortNodesByXCoord,
  StringSlice, TreeCoordsOffset, TreeXRange, UnpositionedBranchingNode, UnpositionedFormerlyBranchingNode,
  UnpositionedTerminalNode, UnpositionedTree
} from 'npbloom-core';
import mockStrWidth from '../../__mocks__/mockStrWidth';

describe('Node positioning', () => {
  const treeWithTerminalNodes = new UnpositionedTree(
    'Noun verbs.',
    idMap({
      'a': new UnpositionedTerminalNode('N', new TreeCoordsOffset(0, 0), new StringSlice(0, 4)),
      'b': new UnpositionedTerminalNode('V', new TreeCoordsOffset(5, 0), new StringSlice(5, 10)),
    }),
    new PlotCoordsOffset(0, 0),
  );

  const treeWithTriangleNodes = new UnpositionedTree(
    'Noun verb phrases.',
    idMap({
      'a': new UnpositionedTerminalNode('N', new TreeCoordsOffset(0, -10), new StringSlice(0, 4)),
      'b': new UnpositionedTerminalNode('VP', new TreeCoordsOffset(0, 0), new StringSlice(5, 17), true),
    }),
    new PlotCoordsOffset(0, 0),
  );

  const treeWithStrandedNodes = new UnpositionedTree(
    'Noun verbs.',
    idMap({
      'c': new UnpositionedFormerlyBranchingNode('S', new TreeCoordsOffset(0, 0), treeWithTerminalNodes.nodes),
    }),
    new PlotCoordsOffset(0, 0),
  );

  const treeWithBranchingNodes = new UnpositionedTree(
    'Noun verbs.',
    idMap({
      'a': new UnpositionedTerminalNode('N', new TreeCoordsOffset(0, 0), new StringSlice(0, 4)),
      'b': new UnpositionedTerminalNode('V', new TreeCoordsOffset(5, 0), new StringSlice(5, 10)),
      'c': new UnpositionedBranchingNode('S', new TreeCoordsOffset(0, 0), set(['a', 'b'])),
    }),
    new PlotCoordsOffset(0, 0),
  );

  const treeWithBranchingAndTriangleNodes = new UnpositionedTree(
    'Noun verb phrases.',
    idMap({
      'a': new UnpositionedTerminalNode('N', new TreeCoordsOffset(0, -10), new StringSlice(0, 4)),
      'b': new UnpositionedTerminalNode('VP', new TreeCoordsOffset(0, 0), new StringSlice(5, 17), true),
      'c': new UnpositionedBranchingNode('S', new TreeCoordsOffset(0, 0), set(['a', 'b'])),
    }),
    new PlotCoordsOffset(0, 0),
  );

  it('positions terminal nodes', () => {
    const result = applyNodePositionsToTree(mockStrWidth, treeWithTerminalNodes);
    expect(result.node('a').position).toStrictEqual(new CoordsInTree(18, -2));
    expect(result.node('b').position).toStrictEqual(new CoordsInTree(62, -2));
  });

  it('positions terminal nodes with triangles', () => {
    const result = applyNodePositionsToTree(mockStrWidth, treeWithTriangleNodes);
    expect(result.node('a').position).toStrictEqual(new CoordsInTree(18, -12));
    expect(result.node('b').position).toStrictEqual(new CoordsInTree(79.5, -20));
  });

  it('positions stranded nodes', () => {
    const result = applyNodePositionsToTree(mockStrWidth, treeWithStrandedNodes);
    expect(result.node('c').position).toStrictEqual(new CoordsInTree(40, -42));
  });

  it('positions branching nodes', () => {
    const result = applyNodePositionsToTree(mockStrWidth, treeWithBranchingNodes);
    expect(result.node('c').position).toStrictEqual(new CoordsInTree(40, -42));
  });

  it('positions branching and triangle nodes', () => {
    const result = applyNodePositionsToTree(mockStrWidth, treeWithBranchingAndTriangleNodes);
    expect(result.node('c').position).toStrictEqual(new CoordsInTree(48.75, -60));
  });

  it('positions triangle vertices', () => {
    const result = applyNodePositionsToTree(mockStrWidth, treeWithTriangleNodes);
    const triangleNode = result.node('b') as PositionedTerminalNode;
    expect(triangleNode.triangle).toStrictEqual(new TreeXRange(40, 119));
  });

  it('sorts node IDs by X coordinate, given a tree', () => {
    expect(sortNodesByXCoord(mockStrWidth, treeWithBranchingNodes, set(['b', 'a']))).toStrictEqual(['a', 'b']);
    expect(sortNodesByXCoord(mockStrWidth, treeWithBranchingNodes, set(['a', 'c']))).toStrictEqual(['a', 'c']);
  });

  it('measures tree width', () => {
    const result = applyNodePositionsToTree(mockStrWidth, treeWithBranchingAndTriangleNodes);
    expect(result.width).toBe(123);
  });
});
