import { describe, expect, it } from 'vitest';
import {
  adoptNodesInTree, deleteNodesInTree, disownNodesInTree, getNodeIdsAssignedToSlice, getParentNodeIdsInTree,
  insertNodeIntoTree, transformAllNodesInTree, transformNodeInTree, transformNodesInTree,
} from '../../../content/unpositioned/manipulation';
import { UnpositionedTree } from '../../../content/unpositioned/types';

describe('tree manipulation', () => {
  const tree: UnpositionedTree = {
    sentence: 'Noun verbed.',
    nodes: {
      'top': { label: 'S', offset: { dTreeX: 0, dTreeY: 5 }, children: ['branch1', 'term2'] },
      'branch1': { label: 'NP', offset: { dTreeX: 0, dTreeY: 0 }, children: ['term1'] },
      'term1': { label: 'N', offset: { dTreeX: 0, dTreeY: 0 }, slice: [0, 4], triangle: false },
      'term2': { label: 'VP', offset: { dTreeX: 0, dTreeY: 0 }, slice: [5, 11], triangle: false },
    },
    offset: { dPlotX: 0, dPlotY: 0 },
  };

  const treeWithoutTopLevelTerminalNode: UnpositionedTree = {
    ...tree,
    nodes: {
      'top': { label: 'S', offset: { dTreeX: 0, dTreeY: 5 }, children: ['branch1'] },
      'branch1': { label: 'NP', offset: { dTreeX: 0, dTreeY: 0 }, children: ['term1'] },
      'term1': { label: 'N', offset: { dTreeX: 0, dTreeY: 0 }, slice: [0, 4], triangle: false },
    },
  };

  const treeWithoutTopLevelBranchingNode: UnpositionedTree = {
    ...tree,
    nodes: {
      'branch1': { label: 'NP', offset: { dTreeX: 0, dTreeY: 0 }, children: ['term1'] },
      'term1': { label: 'N', offset: { dTreeX: 0, dTreeY: 0 }, slice: [0, 4], triangle: false },
      'term2': { label: 'VP', offset: { dTreeX: 0, dTreeY: 0 }, slice: [5, 11], triangle: false },
    },
  };

  const treeWithStrandedNode: UnpositionedTree = {
    sentence: 'Noun verbed it.',
    nodes: {
      'top': { label: 'S', offset: { dTreeX: 0, dTreeY: 5 }, children: ['branch1', 'stranded'] },
      'branch1': { label: 'NP', offset: { dTreeX: 0, dTreeY: 0 }, children: ['term1'] },
      'term1': { label: 'N', offset: { dTreeX: 0, dTreeY: 0 }, slice: [0, 4], triangle: false },
      'stranded': { label: 'VP', offset: { dTreeX: 2, dTreeY: -10 }, formerSlice: [5, 14], formerlyTriangle: true },
      'term2': { label: 'V', offset: { dTreeX: 0, dTreeY: 0 }, slice: [5, 11], triangle: false },
      'term3': { label: 'N', offset: { dTreeX: 0, dTreeY: 0 }, slice: [12, 14], triangle: false },
    },
    offset: { dPlotX: 0, dPlotY: 0 },
  };

  const treeWithNodeMissingBranches: UnpositionedTree = {
    sentence: 'Noun verbed and verbed.',
    nodes: {
      'top': { label: 'S', offset: { dTreeX: 0, dTreeY: 5 }, children: ['branch1', 'branch2'] },
      'branch1': { label: 'NP', offset: { dTreeX: 0, dTreeY: 0 }, children: ['term1'] },
      'term1': { label: 'N', offset: { dTreeX: 0, dTreeY: 0 }, slice: [0, 4], triangle: false },
      'branch2': { label: 'VP', offset: { dTreeX: 0, dTreeY: 0 }, children: ['term2'], triangle: true },
      'term2': { label: 'VP', offset: { dTreeX: 0, dTreeY: 0 }, slice: [5, 11], triangle: true },
      'term3': { label: 'Conj', offset: { dTreeX: 0, dTreeY: 0 }, slice: [12, 15], triangle: false },
      'term4': { label: 'VP', offset: { dTreeX: 0, dTreeY: 0 }, slice: [16, 22], triangle: true },
    },
    offset: { dPlotX: 0, dPlotY: 0 },
  };

  const treeWithTerminalBecomingBranching: UnpositionedTree = {
    sentence: 'Noun verbed adverbly.',
    nodes: {
      'top': { label: 'S', offset: { dTreeX: 0, dTreeY: 5 }, children: ['branch1', 'shapeshifter'] },
      'branch1': { label: 'NP', offset: { dTreeX: 0, dTreeY: 0 }, children: ['term1'] },
      'term1': { label: 'N', offset: { dTreeX: 0, dTreeY: 0 }, slice: [0, 4], triangle: false },
      'shapeshifter': { label: 'VP', offset: { dTreeX: 0, dTreeY: 0 }, slice: [5, 20], triangle: true },
      'term2': { label: 'V', offset: { dTreeX: 0, dTreeY: 0 }, slice: [5, 11], triangle: false },
      'term3': { label: 'AdvP', offset: { dTreeX: 0, dTreeY: 0 }, slice: [12, 20], triangle: true },
    },
    offset: { dPlotX: 0, dPlotY: 0 },
  };

  const changeLabel = transformNodeInTree(node => ({ ...node, label: 'test' }));

  it('retrieves the parent ID of a single node', () => {
    expect(getParentNodeIdsInTree(['term1'])(tree)).toStrictEqual(['branch1']);
  });

  it('retrieves the parent ID of two sibling nodes', () => {
    expect(getParentNodeIdsInTree(['branch1', 'term2'])(tree)).toStrictEqual(['top']);
  });

  it('retrieve the parent IDs of two non-sibling nodes', () => {
    expect(getParentNodeIdsInTree(['branch1', 'term1'])(tree)).toStrictEqual(['top', 'branch1']);
  });

  it('retrieves no parent IDs for a top-level node', () => {
    expect(getParentNodeIdsInTree(['top'])(tree)).toStrictEqual([]);
  });

  it('retrieves only one parent ID for two non-sibling nodes of which one is a top-level node', () => {
    expect(getParentNodeIdsInTree(['top', 'term1'])(tree)).toStrictEqual(['branch1']);
  });

  it('retrieves the terminal ID associated with a slice when there is only one', () => {
    expect(getNodeIdsAssignedToSlice([5, 11])(tree)).toStrictEqual(['term2']);
  });

  it('retrieves the terminal ID associated with a slice when there is only one and it covers more than the slice', () => {
    expect(getNodeIdsAssignedToSlice([6, 10])(tree)).toStrictEqual(['term2']);
  });

  it('retrieves all terminal IDs associated with a slice when there are multiple', () => {
    expect(getNodeIdsAssignedToSlice([3, 9])(tree)).toStrictEqual(['term1', 'term2']);
  });

  it('retrieves no terminal IDs associated with a slice when there are none', () => {
    expect(getNodeIdsAssignedToSlice([5, 11])(treeWithoutTopLevelTerminalNode)).toStrictEqual([]);
  });

  it('inserts a top-level terminal node', () => {
    expect(insertNodeIntoTree({
      label: 'V',
      targetSlice: [5, 11],
      triangle: false,
    })('new')(treeWithoutTopLevelTerminalNode)).toMatchSnapshot();
  });

  it('inserts a top-level terminal node with a triangle', () => {
    expect(insertNodeIntoTree({
      label: 'VP',
      targetSlice: [5, 11],
      triangle: true,
    })('new')(treeWithoutTopLevelTerminalNode)).toMatchSnapshot();
  });

  it('inserts a top-level branching node with one child', () => {
    expect(insertNodeIntoTree({
      label: 'VP',
      targetChildIds: ['term2'],
    })('new')(treeWithoutTopLevelBranchingNode)).toMatchSnapshot();
  });

  it('inserts a top-level branching node with two children', () => {
    expect(insertNodeIntoTree({
      label: 'S',
      targetChildIds: ['branch1', 'term2'],
    })('new')(treeWithoutTopLevelBranchingNode)).toMatchSnapshot();
  });

  it('inserts a branching node down the tree with a terminal child', () => {
    expect(insertNodeIntoTree({
      label: 'N\'',
      targetParentId: 'branch1',
      targetChildIds: ['term1'],
    })('new')(tree)).toMatchSnapshot();
  });

  it('inserts a branching node down the tree with a branching child', () => {
    expect(insertNodeIntoTree({
      label: '?',
      targetParentId: 'top',
      targetChildIds: ['branch1'],
    })('new')(tree)).toMatchSnapshot();
  });

  it('inserts a branching node down the tree with two children', () => {
    expect(insertNodeIntoTree({
      label: '?',
      targetParentId: 'top',
      targetChildIds: ['branch1', 'term2'],
    })('new')(tree)).toMatchSnapshot();
  });

  it('changes the label of a node', () => {
    expect(changeLabel('branch1')(tree).nodes).toMatchSnapshot();
  });

  it('changes trianglehood of two nodes at the same time', () => {
    expect(transformNodesInTree(node => ({ ...node, triangle: true }))(['term1', 'term2'])(tree).nodes)
      .toMatchSnapshot();
  });

  it('assigns an existing node as a child of an already branching node', () => {
    expect(adoptNodesInTree('branch2', ['term3'])(treeWithNodeMissingBranches).nodes['branch2'])
      .toMatchObject({ children: ['term2', 'term3'] });
  });

  it('assigns an existing node as a child of a previously terminal node', () => {
    expect(adoptNodesInTree('shapeshifter', ['term2'])(treeWithTerminalBecomingBranching).nodes['shapeshifter'])
      .toMatchObject({ children: ['term2'] });
  });

  it('assigns an existing node as a child of a previously stranded node', () => {
    expect(adoptNodesInTree('stranded', ['term2'])(treeWithStrandedNode).nodes['stranded'])
      .toMatchObject({ children: ['term2'] });
  });

  it('assigns two existing nodes as children of an already branching node', () => {
    expect(adoptNodesInTree('branch2', ['term3', 'term4'])(treeWithNodeMissingBranches).nodes['branch2'])
      .toMatchObject({ children: ['term2', 'term3', 'term4'] });
  });

  it('assigns two existing nodes as children of a previously terminal node', () => {
    expect(adoptNodesInTree('shapeshifter', ['term2', 'term3'])(treeWithTerminalBecomingBranching).nodes['shapeshifter'])
      .toMatchObject({ children: ['term2', 'term3'] });
  });

  it('assigns two existing nodes as children of a previously stranded node', () => {
    expect(adoptNodesInTree('stranded', ['term2', 'term3'])(treeWithStrandedNode).nodes['stranded'])
      .toMatchObject({ children: ['term2', 'term3'] });
  });

  it('resets position offset to zero when a stranded node adopts children', () => {
    expect(adoptNodesInTree('stranded', ['term2'])(treeWithStrandedNode).nodes['stranded'].offset)
      .toStrictEqual({ dTreeX: 0, dTreeY: 0 });
  });

  it('keeps a branching node branching when one of multiple children is disowned', () => {
    expect(disownNodesInTree('top', ['branch1'])(tree).nodes['top']).toMatchObject({ children: ['term2'] });
  });

  it('makes a branching node stranded when its only child is disowned', () => {
    expect(disownNodesInTree('branch1', ['term1'])(tree).nodes['branch1']).toMatchObject({
      formerDescendants: {
        'term1': tree.nodes['term1'],
      },
    });
  });

  it('makes a branching node stranded when all of its children are disowned', () => {
    expect(disownNodesInTree('top', ['branch1', 'term2'])(tree).nodes['top']).toMatchObject({
      formerDescendants: {
        'term1': tree.nodes['term1'],
        'term2': tree.nodes['term2'],
        'branch1': tree.nodes['branch1'],
      },
    });
  });

  it('removes the connection between a parent and child when another node adopts the child', () => {
    expect(adoptNodesInTree('branch1', ['term2'])(tree).nodes).toMatchObject({
      'top': { children: ['branch1'] },
      'branch1': { children: ['term1', 'term2'] },
    });
  });

  it('does not allow a node to adopt itself', () => {
    expect(adoptNodesInTree('top', ['top'])(tree)).toBe(tree);
  });

  it('changes all nodes in the tree', () => {
    expect(transformAllNodesInTree(node => ({ ...node, label: 'test' }))(tree).nodes).toMatchSnapshot();
  });

  it('deletes a top-level node', () => {
    expect(deleteNodesInTree(['top'])(tree).nodes).toMatchSnapshot();
  });

  it('deletes a branching node down the tree', () => {
    expect(deleteNodesInTree(['branch1'])(tree).nodes).toMatchSnapshot();
  });

  it('deletes a terminal node down the tree', () => {
    expect(deleteNodesInTree(['term2'])(tree).nodes).toMatchSnapshot();
  });

  it('deletes two nodes with direct parent-child relationship at once', () => {
    expect(deleteNodesInTree(['top', 'term2'])(tree).nodes).toMatchSnapshot();
  });

  it('deletes two nodes with ancestor-descendant relationship at once', () => {
    expect(deleteNodesInTree(['top', 'term1'])(tree).nodes).toMatchSnapshot();
  });

  it('deletes two nodes with no ancestor-descendant relationship at once', () => {
    expect(deleteNodesInTree(['term1', 'term2'])(tree).nodes).toMatchSnapshot();
  });

  it('makes a branching node stranded when its children are gone', () => {
    expect(deleteNodesInTree(['branch1', 'term2'])(tree).nodes).toMatchSnapshot();
  });

  describe('referential equality of nodes after changes', () => {
    it('keeps unaffected nodes', () => {
      const treeAfterChange = changeLabel('branch1')(tree);
      expect(tree.nodes['term2']).toBe(treeAfterChange.nodes['term2']);
    });
  
    it('keeps children of deleted nodes', () => {
      const treeAfterChange = deleteNodesInTree(['top'])(tree);
      expect(tree.nodes['branch1']).toBe(treeAfterChange.nodes['branch1']);
      expect(tree.nodes['term2']).toBe(treeAfterChange.nodes['term2']);
    });
  
    it('changes changed nodes', () => {
      const treeAfterChange = changeLabel('branch1')(tree);
      expect(tree.nodes['branch1']).not.toBe(treeAfterChange.nodes['branch1']);
    });
  
    it('changes parents of deleted nodes', () => {
      const treeAfterChange = deleteNodesInTree(['branch1'])(tree);
      expect(tree.nodes['top']).not.toBe(treeAfterChange.nodes['top']);
    });
  });
});
