import { describe, expect, it } from 'vitest';
import {
  CoordsInPlot, CoordsInTree, filterPositionedNodesInTree, filterPositionedNodesInTreeById, getTopLevelPositionedNodes,
  idMap, idMapGet, idMapKeys, isTopLevel, PositionedBranchingNode, PositionedNode, PositionedTerminalNode,
  PositionedTree, set, sortPositionedNodesByXCoord, StringSlice, TreeXRange
} from 'npbloom-core';
import { IdMap } from '../../../types';

describe('positioned tree/node functions', () => {
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

  const treeWithoutSNode = new PositionedTree(
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

  const predicates: [(node: PositionedNode) => boolean, IdMap<PositionedNode>][] = [
    [
      (node: PositionedNode) => node instanceof PositionedTerminalNode && !!node.triangle,
      idMap({
        'f': new PositionedTerminalNode('AdvP', new CoordsInTree(121.5, -30), new StringSlice(11, 24), new TreeXRange(72, 104)),
      }),
    ],
    [
      (node: PositionedNode) => /^\w+P$/.test(node.label),
      idMap({
        'b': new PositionedBranchingNode('NP', new CoordsInTree(18, -60), set(['c'])),
        'd': new PositionedBranchingNode('VP', new CoordsInTree(89.25, -60), set(['e', 'f'])),
        'f': new PositionedTerminalNode('AdvP', new CoordsInTree(121.5, -30), new StringSlice(11, 24), new TreeXRange(72, 104)),
      }),
    ],
  ]

  it.each(predicates)('filters nodes by arbitrary predicates %#', (predicate, expectedFilteredNodes) => {
    expect(filterPositionedNodesInTree(predicate, tree)).toStrictEqual(expectedFilteredNodes);
  });

  it('filters nodes by IDs', () => {
    const filteredNodes = filterPositionedNodesInTreeById(set(['a', 'e']), tree);
    expect(idMapKeys(filteredNodes)).toStrictEqual(set(['a', 'e']));
    expect(idMapGet(filteredNodes, 'a')).toStrictEqual(tree.node('a'));
    expect(idMapGet(filteredNodes, 'e')).toStrictEqual(tree.node('e'));
  });

  it('returns whether a given node is a top-level node', () => {
    expect(['a', 'b', 'c', 'd', 'e', 'f'].map(nodeId => isTopLevel(tree.nodes, nodeId)))
      .toStrictEqual([true, false, false, true, false, false]);
  });

  it('returns top-level nodes', () => {
    const topLevelPositionedNodes = getTopLevelPositionedNodes(treeWithoutSNode);
    expect(idMapKeys(topLevelPositionedNodes)).toStrictEqual(set(['b', 'd']));
    expect(idMapGet(topLevelPositionedNodes, 'b')).toStrictEqual(treeWithoutSNode.node('b'));
    expect(idMapGet(topLevelPositionedNodes, 'd')).toStrictEqual(treeWithoutSNode.node('d'));
  });

  it('sorts nodes by X position', () => {
    expect(sortPositionedNodesByXCoord(tree, set(['a', 'b', 'c', 'e']))).toStrictEqual(['b', 'c', 'a', 'e']);
  });
});
