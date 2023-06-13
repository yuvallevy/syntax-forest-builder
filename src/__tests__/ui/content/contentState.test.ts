import { describe, expect, it } from 'vitest';
import { ContentAction, ContentState, contentReducer, UndoableContentState } from '../../../ui/content/contentState';

describe('content state', () => {
  const initialState: ContentState = {
    plots: [
      {
        trees: {
          'aa': {
            nodes: {
              'a': { label: 'N', offset: { dTreeX: 0, dTreeY: 0 }, slice: [0, 4], triangle: false },
              'b': { label: 'N', offset: { dTreeX: 1, dTreeY: 10 }, slice: [5, 10], triangle: false },
            },
            offset: { dPlotX: 0, dPlotY: 0 },
            sentence: 'tree state',
          },
          'zz': {
            nodes: {
              'w': { label: 'NP', offset: { dTreeX: -1, dTreeY: 5 }, children: ['x'] },
              'x': { label: 'N', offset: { dTreeX: 1, dTreeY: 8 }, slice: [0, 5], triangle: false },
              'y': { label: 'V', offset: { dTreeX: 0, dTreeY: 0 }, slice: [6, 10], triangle: false },
            },
            offset: { dPlotX: 60, dPlotY: 0 },
            sentence: 'nodes rock',
          },
        }
      }
    ],
  };

  const undoableInitialState: UndoableContentState = {
    current: initialState,
    undoStack: [],
    redoStack: [],
  };

  const testCases: [string, ContentAction][] = [
    [
      'inserts a node into a tree',
      { type: 'insertNode', plotIndex: 0, treeId: 'aa', newNodeId: 'c', newNode: { label: 'NP', targetChildIds: ['a', 'b'] } }
    ],
    [
      'deletes a node from a tree',
      { type: 'deleteNodes', plotIndex: 0, nodeIndicators: [{ treeId: 'aa', nodeId: 'b' }] }
    ],
    [
      'deletes two nodes from two different trees',
      { type: 'deleteNodes', plotIndex: 0, nodeIndicators: [{ treeId: 'aa', nodeId: 'b' }, { treeId: 'zz', nodeId: 'x' }] }
    ],
    [
      'sets a node as a child of another',
      { type: 'adoptNodes', plotIndex: 0, treeId: 'zz', adoptingNodeId: 'x', adoptedNodeIds: ['y'] }
    ],
    [
      'removes a connection between two nodes',
      { type: 'disownNodes', plotIndex: 0, treeId: 'zz', disowningNodeId: 'w', disownedNodeIds: ['x'] }
    ],
    [
      'moves a node in a tree',
      { type: 'moveNodes', plotIndex: 0, nodeIndicators: [{ treeId: 'aa', nodeId: 'a' }], dx: 1, dy: -4 }
    ],
    [
      'resets the positions of two nodes in two different trees',
      { type: 'resetNodePositions', plotIndex: 0, nodeIndicators: [{ treeId: 'aa', nodeId: 'b' }, { treeId: 'zz', nodeId: 'w' }] }
    ],
    [
      'sets the label of a node',
      { type: 'setNodeLabel', plotIndex: 0, nodeIndicator: { treeId: 'aa', nodeId: 'a' }, newLabel: 'NP' }
    ],
    [
      'sets whether a terminal node connects to its slice with a triangle',
      { type: 'setTriangle', plotIndex: 0, nodeIndicators: [{ treeId: 'aa', nodeId: 'b' }], triangle: true }
    ],
    [
      'reacts to a change in the sentence',
      { type: 'setSentence', plotIndex: 0, treeId: 'aa', newSentence: 'tee state', oldSelectedSlice: [2, 2] }
    ],
    [
      'adds a tree to a plot',
      { type: 'addTree', plotIndex: 0, newTreeId: 'zz', offset: { dPlotX: 105, dPlotY: 88 } }
    ],
    [
      'removes a tree from a plot',
      { type: 'removeTree', plotIndex: 0, treeId: 'aa' }
    ],
  ];

  it.each(testCases)('%s', (_, action) => expect(contentReducer(undoableInitialState, action).current).toMatchSnapshot());
});
