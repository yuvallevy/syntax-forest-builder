import { describe, expect, it } from 'vitest';
import { getNodeCreationTriggersForTree } from '../../ui/nodeCreationTriggers';
import mockStrWidth from '../__mocks__/mockStrWidth';
import { PositionedTree } from '../../content/positioned/types';

describe('node creation triggers', () => {
  const treeWithNoUnassignedSlices: PositionedTree = {
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
  const treeWithUnassignedSlices: PositionedTree = {
    sentence: 'Noun verbs very adverbly.',
    nodes: {
      'b': { label: 'NP', position: { treeX: 18, treeY: -60 }, children: ['c'] },
      'c': { label: 'N', position: { treeX: 18, treeY: -2 }, slice: [0, 4] },
      'd': { label: 'VP', position: { treeX: 57, treeY: -60 }, children: ['e'] },
      'e': { label: 'V', position: { treeX: 57, treeY: -2 }, slice: [5, 10] },
    },
    position: { plotX: 50, plotY: -32 },
    width: 104,
  };

  it('generates node creation triggers for a tree with all slices assigned', () => {
    expect(getNodeCreationTriggersForTree(mockStrWidth)(treeWithNoUnassignedSlices)).toMatchSnapshot();
  });

  it('generates node creation triggers for a tree with unassigned slices', () => {
    expect(getNodeCreationTriggersForTree(mockStrWidth)(treeWithUnassignedSlices)).toMatchSnapshot();
  });
});
