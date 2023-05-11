import { describe, expect, it } from 'vitest';
import { IdMap } from '../../../content/types';
import {
  filterPositionedNodesInTree, filterPositionedNodesInTreeById, getTopLevelPositionedNodes, sortPositionedNodesByXCoord
} from '../../../content/positioned/positionedEntityHelpers';
import { PositionedNode, PositionedTree } from '../../../content/positioned/types';

describe('positioned tree/node functions', () => {
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

  const treeWithoutSNode: PositionedTree = {
    sentence: 'Noun verbs very adverbly.',
    nodes: {
      'b': { label: 'NP', position: { treeX: 18, treeY: -60 }, children: ['c'] },
      'c': { label: 'N', position: { treeX: 18, treeY: -2 }, slice: [0, 4] },
      'd': { label: 'VP', position: { treeX: 89.25, treeY: -60 }, children: ['e', 'f'] },
      'e': { label: 'V', position: { treeX: 57, treeY: -2 }, slice: [5, 10] },
      'f': { label: 'AdvP', position: { treeX: 121.5, treeY: -30 }, triangle: { treeX1: 72, treeX2: 104 }, slice: [11, 24] },
    },
    position: { plotX: 50, plotY: -32 },
    width: 104,
  };

  const predicates: [(node: PositionedNode) => boolean, IdMap<PositionedNode>][] = [
    [
      (node: PositionedNode) => 'triangle' in node && node.triangle !== undefined,
      {
        'f': { label: 'AdvP', position: { treeX: 121.5, treeY: -30 }, triangle: { treeX1: 72, treeX2: 104 }, slice: [11, 24] },
      },
    ],
    [
      (node: PositionedNode) => /^\w+P$/.test(node.label),
      {
        'b': { label: 'NP', position: { treeX: 18, treeY: -60 }, children: ['c'] },
        'd': { label: 'VP', position: { treeX: 89.25, treeY: -60 }, children: ['e', 'f'] },
        'f': { label: 'AdvP', position: { treeX: 121.5, treeY: -30 }, triangle: { treeX1: 72, treeX2: 104 }, slice: [11, 24] },
      },
    ],
  ]

  it.each(predicates)('filters nodes by arbitrary predicates %#', (predicate, expectedFilteredNodes) => {
    expect(filterPositionedNodesInTree(predicate)(tree)).toStrictEqual(expectedFilteredNodes);
  });

  it('filters nodes by IDs', () => {
    expect(filterPositionedNodesInTreeById(['a', 'e'])(tree)).toStrictEqual({
      'a': tree.nodes['a'],
      'e': tree.nodes['e'],
    });
  });

  it('returns top-level nodes', () => {
    expect(getTopLevelPositionedNodes(treeWithoutSNode)).toStrictEqual({
      b: tree.nodes['b'],
      d: tree.nodes['d'],
    });
  });

  it('sorts nodes by X position', () => {
    expect(sortPositionedNodesByXCoord(tree)(['a', 'b', 'c', 'e'])).toStrictEqual(['b', 'c', 'a', 'e']);
  });
});
