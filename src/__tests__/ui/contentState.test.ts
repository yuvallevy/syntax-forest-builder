import { describe, expect, it } from 'vitest';
import { ContentAction, ContentState, contentReducer, UndoableContentState } from '../../ui/contentState';

describe('content state', () => {
  const initialState: ContentState = {
    plots: {
      'plot': {
        trees: {
          'aa': {
            nodes: {
              'a': { label: 'N', offset: { dTreeX: 0, dTreeY: 0 }, slice: [0, 4], triangle: false },
              'b': { label: 'N', offset: { dTreeX: 0, dTreeY: 0 }, slice: [5, 10], triangle: false },
            },
            offset: { dPlotX: 0, dPlotY: 0 },
            sentence: 'tree state',
          }
        }
      }
    },
  };

  const undoableInitialState: UndoableContentState = {
    current: initialState,
    undoStack: [],
    redoStack: [],
  };

  const testCases: [string, ContentAction][] = [
    [
      'inserts a node into a tree',
      { type: 'insertNode', plotId: 'plot', treeId: 'aa', newNodeId: 'c', newNode: { label: 'NP', targetChildIds: ['a', 'b'] } }
    ],
    [
      'deletes a node from a tree',
      { type: 'deleteNodes', plotId: 'plot', nodes: [{ treeId: 'aa', nodeId: 'b' }] }
    ],
    [
      'sets the label of a node',
      { type: 'setNodeLabel', plotId: 'plot', node: { treeId: 'aa', nodeId: 'a' }, newLabel: 'NP' }
    ],
    [
      'reacts to a change in the sentence',
      { type: 'setSentence', plotId: 'plot', treeId: 'aa', newSentence: 'tee state', oldSelectedSlice: [2, 2] }
    ],
    [
      'adds a tree to a plot',
      { type: 'addTree', plotId: 'plot', newTreeId: 'zz', offset: { dPlotX: 105, dPlotY: 88 } }
    ],
    [
      'removes a tree from a plot',
      { type: 'removeTree', plotId: 'plot', treeId: 'aa' }
    ],
  ];

  it.each(testCases)('%s', (_, action) => expect(contentReducer(undoableInitialState, action).current).toMatchSnapshot());
});
