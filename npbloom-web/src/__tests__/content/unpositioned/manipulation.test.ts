import { describe, expect, it } from 'vitest';
import {
  arrayFromSet, idMap, InsertedBranchingNode, InsertedTerminalNode, jsNodeMapRepr, jsTreeRepr, PlotCoordsOffset, set,
  StringSlice, TreeCoordsOffset, UnpositionedBranchingNode, UnpositionedFormerlyTerminalNode, UnpositionedNode,
  UnpositionedTerminalNode, UnpositionedTree
} from 'npbloom-core';

describe('tree manipulation', () => {
  const tree = new UnpositionedTree(
    'Noun verbed.',
    idMap({
      'top': new UnpositionedBranchingNode('S', new TreeCoordsOffset(0, 5), set(['branch1', 'term2'])),
      'branch1': new UnpositionedBranchingNode('NP', new TreeCoordsOffset(0, 0), set(['term1'])),
      'term1': new UnpositionedTerminalNode('N', new TreeCoordsOffset(0, 0), new StringSlice(0, 4)),
      'term2': new UnpositionedTerminalNode('VP', new TreeCoordsOffset(0, 0), new StringSlice(5, 11)),
    }),
    new PlotCoordsOffset(0, 0),
  );

  const treeWithoutTopLevelTerminalNode = new UnpositionedTree(
    'Noun verbed.',
    idMap({
      'top': new UnpositionedBranchingNode('S', new TreeCoordsOffset(0, 5), set(['branch1'])),
      'branch1': new UnpositionedBranchingNode('NP', new TreeCoordsOffset(0, 0), set(['term1'])),
      'term1': new UnpositionedTerminalNode('N', new TreeCoordsOffset(0, 0), new StringSlice(0, 4)),
    }),
    new PlotCoordsOffset(0, 0),
  );

  const treeWithoutTopLevelBranchingNode = new UnpositionedTree(
    'Noun verbed.',
    idMap({
      'branch1': new UnpositionedBranchingNode('NP', new TreeCoordsOffset(0, 0), set(['term1'])),
      'term1': new UnpositionedTerminalNode('N', new TreeCoordsOffset(0, 0), new StringSlice(0, 4)),
      'term2': new UnpositionedTerminalNode('VP', new TreeCoordsOffset(0, 0), new StringSlice(5, 11)),
    }),
    new PlotCoordsOffset(0, 0),
  );

  const treeWithStrandedNode = new UnpositionedTree(
    'Noun verbed it.',
    idMap({
      'top': new UnpositionedBranchingNode('S', new TreeCoordsOffset(0, 5), set(['branch1', 'stranded'])),
      'branch1': new UnpositionedBranchingNode('NP', new TreeCoordsOffset(0, 0), set(['term1'])),
      'term1': new UnpositionedTerminalNode('N', new TreeCoordsOffset(0, 0), new StringSlice(0, 4)),
      'stranded': new UnpositionedFormerlyTerminalNode('VP', new TreeCoordsOffset(2, -10), new StringSlice(5, 14), true),
      'term2': new UnpositionedTerminalNode('V', new TreeCoordsOffset(0, 0), new StringSlice(5, 11)),
      'term3': new UnpositionedTerminalNode('N', new TreeCoordsOffset(0, 0), new StringSlice(12, 14)),
    }),
    new PlotCoordsOffset(0, 0),
  );

  const treeWithNodeMissingBranches = new UnpositionedTree(
    'Noun verbed and verbed.',
    idMap({
      'top': new UnpositionedBranchingNode('S', new TreeCoordsOffset(0, 5), set(['branch1', 'branch2'])),
      'branch1': new UnpositionedBranchingNode('NP', new TreeCoordsOffset(0, 0), set(['term1'])),
      'term1': new UnpositionedTerminalNode('N', new TreeCoordsOffset(0, 0), new StringSlice(0, 4)),
      'branch2': new UnpositionedBranchingNode('VP', new TreeCoordsOffset(0, 0), set(['term2'])),
      'term2': new UnpositionedTerminalNode('VP', new TreeCoordsOffset(0, 0), new StringSlice(5, 11), true),
      'term3': new UnpositionedTerminalNode('Conj', new TreeCoordsOffset(0, 0), new StringSlice(12, 15)),
      'term4': new UnpositionedTerminalNode('VP', new TreeCoordsOffset(0, 0), new StringSlice(16, 22), true),
    }),
    new PlotCoordsOffset(0, 0),
  );

  const treeWithTerminalBecomingBranching = new UnpositionedTree(
    'Noun verbed adverbly.',
    idMap({
      'top': new UnpositionedBranchingNode('S', new TreeCoordsOffset(0, 5), set(['branch1', 'shapeshifter'])),
      'branch1': new UnpositionedBranchingNode('NP', new TreeCoordsOffset(0, 0), set(['term1'])),
      'term1': new UnpositionedTerminalNode('N', new TreeCoordsOffset(0, 0), new StringSlice(0, 4)),
      'shapeshifter': new UnpositionedTerminalNode('VP', new TreeCoordsOffset(0, 0), new StringSlice(5, 20), true),
      'term2': new UnpositionedTerminalNode('V', new TreeCoordsOffset(0, 0), new StringSlice(5, 11)),
      'term3': new UnpositionedTerminalNode('AdvP', new TreeCoordsOffset(0, 0), new StringSlice(12, 20), true),
    }),
    new PlotCoordsOffset(0, 0),
  );

  const changeLabel = (node: UnpositionedNode): UnpositionedNode => {
    if (node instanceof UnpositionedTerminalNode) return new UnpositionedTerminalNode('test', node.offset, node.slice, node.triangle);
    if (node instanceof UnpositionedBranchingNode) return new UnpositionedBranchingNode('test', node.offset, node.children);
    return node;
  };

  it('retrieves the parent ID of a single node', () => {
    expect(arrayFromSet(tree.getParentNodeIds(set(['term1'])))).toStrictEqual(['branch1']);
  });

  it('retrieves the parent ID of two sibling nodes', () => {
    expect(arrayFromSet(tree.getParentNodeIds(set(['branch1', 'term2'])))).toStrictEqual(['top']);
  });

  it('retrieve the parent IDs of two non-sibling nodes', () => {
    expect(arrayFromSet(tree.getParentNodeIds(set(['branch1', 'term1'])))).toStrictEqual(['top', 'branch1']);
  });

  it('retrieves no parent IDs for a top-level node', () => {
    expect(arrayFromSet(tree.getParentNodeIds(set(['top'])))).toStrictEqual([]);
  });

  it('retrieves only one parent ID for two non-sibling nodes of which one is a top-level node', () => {
    expect(arrayFromSet(tree.getParentNodeIds(set(['top', 'term1'])))).toStrictEqual(['branch1']);
  });

  it('retrieves the terminal ID associated with a slice when there is only one', () => {
    expect(arrayFromSet(tree.getNodeIdsAssignedToSlice(new StringSlice(5, 11)))).toStrictEqual(['term2']);
  });

  it('retrieves the terminal ID associated with a slice when there is only one and it covers more than the slice', () => {
    expect(arrayFromSet(tree.getNodeIdsAssignedToSlice(new StringSlice(6, 10)))).toStrictEqual(['term2']);
  });

  it('retrieves all terminal IDs associated with a slice when there are multiple', () => {
    expect(arrayFromSet(tree.getNodeIdsAssignedToSlice(new StringSlice(3, 9)))).toStrictEqual(['term1', 'term2']);
  });

  it('retrieves no terminal IDs associated with a slice when there are none', () => {
    expect(arrayFromSet(treeWithoutTopLevelTerminalNode.getNodeIdsAssignedToSlice(new StringSlice(5, 11)))).toStrictEqual([]);
  });

  it('inserts a top-level terminal node', () => {
    expect(jsTreeRepr(treeWithoutTopLevelTerminalNode.insertNode(new InsertedTerminalNode(
      'V',
      null,
      new StringSlice(5, 11),
      false,
    ), 'new'))).toMatchSnapshot();
  });

  it('inserts a top-level terminal node with a triangle', () => {
    expect(jsTreeRepr(treeWithoutTopLevelTerminalNode.insertNode(new InsertedTerminalNode(
      'VP',
      null,
      new StringSlice(5, 11),
      true,
    ), 'new'))).toMatchSnapshot();
  });

  it('inserts a top-level branching node with one child', () => {
    expect(jsTreeRepr(treeWithoutTopLevelBranchingNode.insertNode(new InsertedBranchingNode(
      'VP',
      null,
      set(['term2']),
    ), 'new'))).toMatchSnapshot();
  });

  it('inserts a top-level branching node with two children', () => {
    expect(jsTreeRepr(treeWithoutTopLevelBranchingNode.insertNode(new InsertedBranchingNode(
      'S',
      null,
      set(['branch1', 'term2']),
    ), 'new'))).toMatchSnapshot();
  });

  it('inserts a branching node down the tree with a terminal child', () => {
    expect(jsTreeRepr(tree.insertNode(new InsertedBranchingNode(
      'N\'',
      'branch1',
      set(['term1']),
    ), 'new'))).toMatchSnapshot();
  });

  it('inserts a branching node down the tree with a branching child', () => {
    expect(jsTreeRepr(tree.insertNode(new InsertedBranchingNode(
      '?',
      'top',
      set(['branch1']),
    ), 'new'))).toMatchSnapshot();
  });

  it('inserts a branching node down the tree with two children', () => {
    expect(jsTreeRepr(tree.insertNode(new InsertedBranchingNode(
      '?',
      'top',
      set(['branch1', 'term2']),
    ), 'new'))).toMatchSnapshot();
  });

  it('changes the label of a node', () => {
    expect(jsNodeMapRepr(tree.transformNode('branch1', changeLabel).nodes)).toMatchSnapshot();
  });

  it('changes trianglehood of two nodes at the same time', () => {
    expect(jsNodeMapRepr(
      tree.transformNodes(
        set(['term1', 'term2']),
        node =>
          node instanceof UnpositionedTerminalNode
            ? new UnpositionedTerminalNode(node.label, node.offset, node.slice, true)
            : node,
      ).nodes
    )).toMatchSnapshot();
  });

  it('assigns an existing node as a child of an already branching node', () => {
    expect(jsNodeMapRepr(treeWithNodeMissingBranches.adoptNodes('branch2', set(['term3'])).nodes)['branch2'])
      .toMatchObject({ children: ['term2', 'term3'] });
  });

  it('assigns an existing node as a child of a previously terminal node', () => {
    expect(jsNodeMapRepr(treeWithTerminalBecomingBranching.adoptNodes('shapeshifter', set(['term2'])).nodes)['shapeshifter'])
      .toMatchObject({ children: ['term2'] });
  });

  it('assigns an existing node as a child of a previously stranded node', () => {
    expect(jsNodeMapRepr(treeWithStrandedNode.adoptNodes('stranded', set(['term2'])).nodes)['stranded'])
      .toMatchObject({ children: ['term2'] });
  });

  it('assigns two existing nodes as children of an already branching node', () => {
    expect(jsNodeMapRepr(treeWithNodeMissingBranches.adoptNodes('branch2', set(['term3', 'term4'])).nodes)['branch2'])
      .toMatchObject({ children: ['term2', 'term3', 'term4'] });
  });

  it('assigns two existing nodes as children of a previously terminal node', () => {
    expect(jsNodeMapRepr(treeWithTerminalBecomingBranching.adoptNodes('shapeshifter', set(['term2', 'term3'])).nodes)['shapeshifter'])
      .toMatchObject({ children: ['term2', 'term3'] });
  });

  it('assigns two existing nodes as children of a previously stranded node', () => {
    expect(jsNodeMapRepr(treeWithStrandedNode.adoptNodes('stranded', set(['term2', 'term3'])).nodes)['stranded'])
      .toMatchObject({ children: ['term2', 'term3'] });
  });

  it('resets position offset to zero when a stranded node adopts children', () => {
    expect(jsNodeMapRepr(treeWithStrandedNode.adoptNodes('stranded', set(['term2'])).nodes)['stranded'].offset)
      .toMatchObject(new TreeCoordsOffset(0, 0));
  });

  it('keeps a branching node branching when one of multiple children is disowned', () => {
    expect(jsNodeMapRepr(tree.disownNodes('top', set(['branch1'])).nodes)['top'])
      .toMatchObject({ children: ['term2'] });
  });

  it('makes a branching node stranded when its only child is disowned', () => {
    expect(jsNodeMapRepr(tree.disownNodes('branch1', set(['term1'])).nodes)['branch1']).toMatchObject({
      formerDescendants: {
        'term1': jsNodeMapRepr(tree.nodes)['term1'],
      },
    });
  });

  it('makes a branching node stranded when all of its children are disowned', () => {
    expect(jsNodeMapRepr(tree.disownNodes('top', set(['branch1', 'term2'])).nodes)['top']).toMatchObject({
      formerDescendants: {
        'term1': jsNodeMapRepr(tree.nodes)['term1'],
        'term2': jsNodeMapRepr(tree.nodes)['term2'],
        'branch1': jsNodeMapRepr(tree.nodes)['branch1'],
      },
    });
  });

  it('removes the connection between a parent and child when another node adopts the child', () => {
    expect(jsNodeMapRepr(tree.adoptNodes('branch1', set(['term2'])).nodes)).toMatchObject({
      'top': { children: ['branch1'] },
      'branch1': { children: ['term1', 'term2'] },
    });
  });

  it('does not allow a node to adopt itself', () => {
    expect(tree.adoptNodes('top', set(['top']))).toBe(tree);
  });

  it('changes all nodes in the tree', () => {
    expect(jsNodeMapRepr(tree.transformAllNodes(changeLabel).nodes)).toMatchSnapshot();
  });

  it('deletes a top-level node', () => {
    expect(jsNodeMapRepr(tree.deleteNodes(set(['top'])).nodes)).toMatchSnapshot();
  });

  it('deletes a branching node down the tree', () => {
    expect(jsNodeMapRepr(tree.deleteNodes(set(['branch1'])).nodes)).toMatchSnapshot();
  });

  it('deletes a terminal node down the tree', () => {
    expect(jsNodeMapRepr(tree.deleteNodes(set(['term2'])).nodes)).toMatchSnapshot();
  });

  it('deletes two nodes with direct parent-child relationship at once', () => {
    expect(jsNodeMapRepr(tree.deleteNodes(set(['top', 'term2'])).nodes)).toMatchSnapshot();
  });

  it('deletes two nodes with ancestor-descendant relationship at once', () => {
    expect(jsNodeMapRepr(tree.deleteNodes(set(['top', 'term1'])).nodes)).toMatchSnapshot();
  });

  it('deletes two nodes with no ancestor-descendant relationship at once', () => {
    expect(jsNodeMapRepr(tree.deleteNodes(set(['term1', 'term2'])).nodes)).toMatchSnapshot();
  });

  it('makes a branching node stranded when its children are gone', () => {
    expect(jsNodeMapRepr(tree.deleteNodes(set(['branch1', 'term2'])).nodes)).toMatchSnapshot();
  });

  // These won't work with the current interop hacks
  describe.skip('referential equality of nodes after changes', () => {
    it('keeps unaffected nodes', () => {
      const treeAfterChange = tree.transformNode('branch1', changeLabel);
      expect(tree.nodes['term2']).toBe(treeAfterChange.nodes['term2']);
    });

    it('keeps children of deleted nodes', () => {
      const treeAfterChange = tree.deleteNodes(set(['top']));
      expect(tree.nodes['branch1']).toBe(treeAfterChange.nodes['branch1']);
      expect(tree.nodes['term2']).toBe(treeAfterChange.nodes['term2']);
    });

    it('changes changed nodes', () => {
      const treeAfterChange = tree.transformNode('branch1', changeLabel);
      expect(tree.nodes['branch1']).not.toBe(treeAfterChange.nodes['branch1']);
    });

    it('changes parents of deleted nodes', () => {
      const treeAfterChange = tree.deleteNodes(set(['branch1']));
      expect(tree.nodes['top']).not.toBe(treeAfterChange.nodes['top']);
    });
  });
});
