import { describe, expect, it } from 'vitest';
import { UnpositionedTree } from '../../core/types';
import {
  deleteNodesInTree,
  getNodeIdsAssignedToSlice,
  getParentNodeIdsInTree,
  insertNodeIntoTree,
  transformAllNodesInTree,
  transformNodeInTree,
  transformNodesInTree,
} from '../../mantle/manipulation';

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
