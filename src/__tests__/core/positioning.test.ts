import { PositionedBranchingNode, PositionedTerminalNode, UnpositionedTree } from '../../core/types';
import { applyNodePositionsToTree } from '../../core/positioning';
import mockStrWidth from '../__mocks__/mockStrWidth';

const zeroOffset = { offset: { dTreeX: 0, dTreeY: 0 } };

describe('Node positioning', () => {
  const treeWithTerminalNodes: UnpositionedTree = {
    sentence: 'Noun verbs.',
    offset: { dPlotX: 0, dPlotY: 0 },
    nodes: {
      'a': { label: 'N', ...zeroOffset, slice: [0, 4], triangle: false },
      'b': { label: 'V', offset: { dTreeX: 5, dTreeY: 0 }, slice: [5, 10], triangle: false },
    },
  };

  const treeWithTriangleNodes: UnpositionedTree = {
    sentence: 'Noun verb phrases.',
    offset: { dPlotX: 0, dPlotY: 0 },
    nodes: {
      'a': { label: 'N', offset: { dTreeX: 0, dTreeY: -10 }, slice: [0, 4], triangle: false },
      'b': { label: 'VP', ...zeroOffset, slice: [5, 17], triangle: true },
    },
  };

  const treeWithBranchingNodes: UnpositionedTree = {
    ...treeWithTerminalNodes,
    nodes: {
      'c': { label: 'S', ...zeroOffset, children: treeWithTerminalNodes.nodes },
    },
  };

  const treeWithBranchingAndTriangleNodes: UnpositionedTree = {
    ...treeWithTriangleNodes,
    nodes: {
      'c': { label: 'S', ...zeroOffset, children: treeWithTriangleNodes.nodes },
    },
  };

  it('positions terminal nodes', () => {
    const result = applyNodePositionsToTree(mockStrWidth)(treeWithTerminalNodes);
    expect(result.nodes['a'].position).toStrictEqual({ treeX: 18, treeY: -2 });
    expect(result.nodes['b'].position).toStrictEqual({ treeX: 62, treeY: -2 });
  });

  it('positions terminal nodes with triangles', () => {
    const result = applyNodePositionsToTree(mockStrWidth)(treeWithTriangleNodes);
    expect(result.nodes['a'].position).toStrictEqual({ treeX: 18, treeY: -12 });
    expect(result.nodes['b'].position).toStrictEqual({ treeX: 79.5, treeY: -20 });
  });

  it('positions branching nodes', () => {
    const result = applyNodePositionsToTree(mockStrWidth)(treeWithBranchingNodes);
    expect(result.nodes['c'].position).toStrictEqual({ treeX: 40, treeY: -42 });
  });

  it('positions branching and triangle nodes', () => {
    const result = applyNodePositionsToTree(mockStrWidth)(treeWithBranchingAndTriangleNodes);
    expect(result.nodes['c'].position).toStrictEqual({ treeX: 48.75, treeY: -60 });
  });

  it('positions triangle vertices', () => {
    const result = applyNodePositionsToTree(mockStrWidth)(treeWithTriangleNodes);
    const triangleNode = result.nodes['b'] as PositionedTerminalNode;
    expect(triangleNode.triangle).toStrictEqual({ treeX1: 40, treeX2: 119 });
  });
});
