import { UnpositionedBranchingNode, UnpositionedTree } from '../../core/types';
import { deleteNodesInTree, findNodeInTree, insertNodeIntoTree, transformAllNodesInTree, transformNodeInTree } from '../../mantle/manipulation';

describe('tree manipulation', () => {
  const tree: UnpositionedTree = {
    sentence: 'Noun verbed.',
    nodes: {
      'top': {
        label: 'S',
        offset: { dTreeX: 0, dTreeY: 5 },
        children: {
          'branch1': {
            label: 'NP',
            offset: { dTreeX: 0, dTreeY: 0 },
            children: {
              'term1': {
                label: 'N',
                offset: { dTreeX: 0, dTreeY: 0 },
                slice: [0, 4],
                triangle: false,
              },
            },
          },
          'term2': {
            label: 'VP',
            offset: { dTreeX: 0, dTreeY: 0 },
            slice: [5, 11],
            triangle: false,
          },
        },
      },
    },
    offset: { dPlotX: 0, dPlotY: 0 },
  };

  const treeWithoutTopLevelTerminalNode: UnpositionedTree = {
    ...tree,
    nodes: {
      'top': {
        label: 'S',
        offset: { dTreeX: 0, dTreeY: 5 },
        children: {
          'branch1': {
            label: 'NP',
            offset: { dTreeX: 0, dTreeY: 0 },
            children: {
              'term1': {
                label: 'N',
                offset: { dTreeX: 0, dTreeY: 0 },
                slice: [0, 4],
                triangle: false,
              },
            },
          },
        },
      },
    },
  };

  const treeWithoutTopLevelBranchingNode: UnpositionedTree = {
    ...tree,
    nodes: {
      'branch1': {
        label: 'NP',
        offset: { dTreeX: 0, dTreeY: 0 },
        children: {
          'term1': {
            label: 'N',
            offset: { dTreeX: 0, dTreeY: 0 },
            slice: [0, 4],
            triangle: false,
          },
        },
      },
      'term2': {
        label: 'V',
        offset: { dTreeX: 0, dTreeY: 0 },
        slice: [5, 11],
        triangle: false,
      },
    },
  };

  const changeLabel = transformNodeInTree(node => ({ ...node, label: 'test' }));

  it('returns a top-level node', () => {
    expect(findNodeInTree('top')(tree)).toBe(tree.nodes['top']);
  });

  it('returns a node one level down the tree', () => {
    expect(findNodeInTree('branch1')(tree))
      .toBe((tree.nodes['top'] as UnpositionedBranchingNode).children['branch1']);
  });

  it('returns a node two levels down the tree', () => {
    expect(findNodeInTree('term1')(tree))
      .toBe(((tree.nodes['top'] as UnpositionedBranchingNode).children['branch1'] as UnpositionedBranchingNode).children['term1']);
  });

  it('returns undefined for nonexistent node', () => {
    expect(findNodeInTree('fictitious')(tree)).not.toBeDefined();
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

  it('changes the label of a top-level node', () => {
    expect(changeLabel('top')(tree).nodes).toMatchSnapshot();
  });

  it('changes the label of a branching node down the tree', () => {
    expect(changeLabel('branch1')(tree).nodes).toMatchSnapshot();
  });

  it('changes the label of a terminal node down the tree', () => {
    expect(changeLabel('term1')(tree).nodes).toMatchSnapshot();
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
      expect((tree.nodes['top'] as UnpositionedBranchingNode).children['term2'])
        .toBe((treeAfterChange.nodes['top'] as UnpositionedBranchingNode).children['term2']);
    });
  
    it('keeps children of changed nodes', () => {
      const treeAfterChange = changeLabel('branch1')(tree);
      expect(((tree.nodes['top'] as UnpositionedBranchingNode).children['branch1'] as UnpositionedBranchingNode).children['term1'])
        .toBe(((treeAfterChange.nodes['top'] as UnpositionedBranchingNode).children['branch1'] as UnpositionedBranchingNode).children['term1']);
    });
  
    it.skip('keeps children of deleted nodes', () => {
      const treeAfterChange = deleteNodesInTree(['top'])(tree);
      expect((tree.nodes['top'] as UnpositionedBranchingNode).children['branch1'])
        .toBe(treeAfterChange.nodes['branch1']);
      expect((tree.nodes['top'] as UnpositionedBranchingNode).children['term2'])
        .toBe(treeAfterChange.nodes['term2']);
    });
  
    it('keeps indirect descendants of changed nodes', () => {
      const treeAfterChange = changeLabel('top')(tree);
      expect(((tree.nodes['top'] as UnpositionedBranchingNode).children['branch1'] as UnpositionedBranchingNode).children['term1'])
        .toBe(((treeAfterChange.nodes['top'] as UnpositionedBranchingNode).children['branch1'] as UnpositionedBranchingNode).children['term1']);
    });
  
    it('changes changed nodes', () => {
      const treeAfterChange = changeLabel('branch1')(tree);
      expect((tree.nodes['top'] as UnpositionedBranchingNode).children['branch1'])
        .not.toBe((treeAfterChange.nodes['top'] as UnpositionedBranchingNode).children['branch1']);
    });
  
    it('changes parents of changed nodes', () => {
      const treeAfterChange = changeLabel('branch1')(tree);
      expect(tree.nodes['top']).not.toBe(treeAfterChange.nodes['top']);
    });
  
    it('changes parents of deleted nodes', () => {
      const treeAfterChange = deleteNodesInTree(['branch1'])(tree);
      expect(tree.nodes['top']).not.toBe(treeAfterChange.nodes['top']);
    });
  
    it('changes indirect ancestors of changed nodes', () => {
      const treeAfterChange = changeLabel('term1')(tree);
      expect(tree.nodes['top']).not.toBe(treeAfterChange.nodes['top']);
    });
  });
});
