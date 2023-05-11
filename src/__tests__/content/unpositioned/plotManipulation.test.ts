import { describe, expect, it } from 'vitest';
import { deleteNodesInPlot, getParentNodeIdsInPlot } from '../../../content/unpositioned/plotManipulation';
import { UnpositionedPlot } from '../../../content/unpositioned/types';

describe('plot manipulation', () => {
  const plot: UnpositionedPlot = {
    trees: {
      'cleo': {
        sentence: 'Cleo laughed.',
        nodes: {
          's1': { label: 'S', offset: { dTreeX: 0, dTreeY: 5 }, children: ['np1', 'vp1'] },
          'np1': { label: 'NP', offset: { dTreeX: 0, dTreeY: 0 }, children: ['n1'] },
          'n1': { label: 'N', offset: { dTreeX: 0, dTreeY: 0 }, slice: [0, 4], triangle: false },
          'vp1': { label: 'VP', offset: { dTreeX: 0, dTreeY: 0 }, slice: [5, 12], triangle: false },
        },
        offset: { dPlotX: 0, dPlotY: 0 },
      },
      'alex': {
        sentence: 'Alex baked cookies.',
        nodes: {
          's2': { label: 'S', offset: { dTreeX: 0, dTreeY: 5 }, children: ['np2a', 'vp2'] },
          'np2a': { label: 'NP', offset: { dTreeX: 0, dTreeY: 0 }, children: ['n2'] },
          'n2': { label: 'N', offset: { dTreeX: 0, dTreeY: 0 }, slice: [0, 4], triangle: false },
          'vp2': { label: 'VP', offset: { dTreeX: 0, dTreeY: 0 }, children: ['v2', 'np2b'] },
          'v2': { label: 'V', offset: { dTreeX: 0, dTreeY: 0 }, slice: [5, 10], triangle: false },
          'np2b': { label: 'NP', offset: { dTreeX: 0, dTreeY: 0 }, slice: [11, 18], triangle: false },
        },
        offset: { dPlotX: 0, dPlotY: 0 },
      },
    },
  };

  it('retrieves the tree ID and parent node ID of a single node', () => {
    expect(getParentNodeIdsInPlot([{ treeId: 'alex', nodeId: 'vp2' }])(plot))
      .toStrictEqual([{ treeId: 'alex', nodeId: 's2' }]);
  });

  it('retrieves the tree ID and parent node ID of two sibling nodes', () => {
    expect(getParentNodeIdsInPlot([{ treeId: 'alex', nodeId: 'np2a' }, { treeId: 'alex', nodeId: 'vp2' }])(plot))
      .toStrictEqual([{ treeId: 'alex', nodeId: 's2' }]);
  });

  it('retrieve the tree ID and parent node IDs of two non-sibling nodes on the same tree', () => {
    expect(getParentNodeIdsInPlot([{ treeId: 'alex', nodeId: 'np2a' }, { treeId: 'alex', nodeId: 'n2' }])(plot))
      .toStrictEqual([{ treeId: 'alex', nodeId: 's2' }, { treeId: 'alex', nodeId: 'np2a' }]);
  });

  it('retrieves no parent node IDs for a top-level node', () => {
    expect(getParentNodeIdsInPlot([{ treeId: 'alex', nodeId: 's2' }])(plot))
      .toStrictEqual([]);
  });

  it('retrieves only one tree ID and parent node ID for two non-sibling nodes on the same tree, ' +
    'of which one is a top-level node', () => {
    expect(getParentNodeIdsInPlot([{ treeId: 'alex', nodeId: 's2' }, { treeId: 'alex', nodeId: 'n2' }])(plot))
      .toStrictEqual([{ treeId: 'alex', nodeId: 'np2a' }]);
  });

  it('deletes nodes across multiple trees on one plot', () => {
    expect(deleteNodesInPlot(
      [{ treeId: 'cleo', nodeId: 's1' }, { treeId: 'cleo', nodeId: 'np1' }, { treeId: 'alex', nodeId: 'vp2' }])(plot).trees)
      .toStrictEqual({
        'cleo': {
          sentence: 'Cleo laughed.',
          nodes: {
            'n1': { label: 'N', offset: { dTreeX: 0, dTreeY: 0 }, slice: [0, 4], triangle: false },
            'vp1': { label: 'VP', offset: { dTreeX: 0, dTreeY: 0 }, slice: [5, 12], triangle: false },
          },
          offset: { dPlotX: 0, dPlotY: 0 },
        },
        'alex': {
          sentence: 'Alex baked cookies.',
          nodes: {
            's2': { label: 'S', offset: { dTreeX: 0, dTreeY: 5 }, children: ['np2a'] },
            'np2a': { label: 'NP', offset: { dTreeX: 0, dTreeY: 0 }, children: ['n2'] },
            'n2': { label: 'N', offset: { dTreeX: 0, dTreeY: 0 }, slice: [0, 4], triangle: false },
            'v2': { label: 'V', offset: { dTreeX: 0, dTreeY: 0 }, slice: [5, 10], triangle: false },
            'np2b': { label: 'NP', offset: { dTreeX: 0, dTreeY: 0 }, slice: [11, 18], triangle: false },
          },
          offset: { dPlotX: 0, dPlotY: 0 },
        },
      });
  });
});
