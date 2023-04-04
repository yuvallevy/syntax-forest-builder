import { Id, IdMap, NodeSlice, Sentence, UnpositionedPlot, UnpositionedTree } from '../core/types';
import { deleteNodesInTree, InsertedNode, insertNodeIntoTree, transformNodeInTree } from '../mantle/manipulation';
import UndoRedoHistory, { ApplyActionFunc, applyToHistory, redo, ReverseActionFunc, undo, UndoableActionCommon } from '../mantle/UndoRedoHistory';
import { handleLocalSentenceChange } from './editNodes';

export type TreeAndNodeId = {
  treeId: Id;
  nodeId: Id;
};

/**
 * Represents an action taken by the user.
 * To integrate with the undo/redo system, each action is translated into an undoable "state change",
 * which is subsequently applied in a reversible fashion.
 */
export type ContentAction =
  | { type: 'insertNode', plotId: Id, treeId: Id, newNodeId: Id, newNode: InsertedNode }
  | { type: 'deleteNodes', plotId: Id, nodes: TreeAndNodeId[] }
  | { type: 'setNodeLabel', plotId: Id, node: TreeAndNodeId, newLabel: string }
  | { type: 'setSentence', plotId: Id, treeId: Id, newSentence: Sentence, oldSelection: NodeSlice }
;

/**
 * Represents a change in state as a result of an action done by the user.
 * Each state change includes information about the state before it so it can be easily undone,
 * and each action by the user is translated into a state change so that undo/redo can work smoothly.
 */
type ContentChange = (
  | {
    type: 'setTree',
    plotId: Id,
    treeId: Id,
    old: UnpositionedTree,
    new: UnpositionedTree,
  }
);

type UndoableContentChange = UndoableActionCommon & ContentChange;

/**
 * Translates a user action into a state change, which can later be undone.
 */
const makeUndoable = (state: ContentState) => (action: ContentAction): ContentChange => {
  switch (action.type) {
    case 'insertNode':
      return {
        type: 'setTree',
        plotId: action.plotId,
        treeId: action.treeId,
        old: state.plots[action.plotId].trees[action.treeId],
        new: insertNodeIntoTree(action.newNode)(action.newNodeId)(state.plots[action.plotId].trees[action.treeId]),
      };
    case 'deleteNodes':
      const treeId = action.nodes[0].treeId;  // TODO: Use all trees
      return {
        type: 'setTree',
        plotId: action.plotId,
        treeId: treeId,
        old: state.plots[action.plotId].trees[treeId],
        new: deleteNodesInTree(action.nodes.map(({ nodeId }) => nodeId))(state.plots[action.plotId].trees[treeId]),
      };
    case 'setNodeLabel':
      return {
        type: 'setTree',
        plotId: action.plotId,
        treeId: action.node.treeId,
        old: state.plots[action.plotId].trees[action.node.treeId],
        new: transformNodeInTree(node => ({ ...node, label: action.newLabel }))(action.node.nodeId)(
          state.plots[action.plotId].trees[action.node.treeId]),
      };
    case 'setSentence':
      return {
        type: 'setTree',
        plotId: action.plotId,
        treeId: action.treeId,
        old: state.plots[action.plotId].trees[action.treeId],
        new: handleLocalSentenceChange(action.newSentence, action.oldSelection)(
          state.plots[action.plotId].trees[action.treeId]),
      }
  }
};

const applyUndoableAction: ApplyActionFunc<UndoableContentChange, ContentState> = action => state => {
  switch (action.type) {
    case 'setTree':
      return {
        ...state,
        plots: {
          ...state.plots,
          [action.plotId]: {
            ...state.plots[action.plotId],
            trees: {
              ...state.plots[action.plotId].trees,
              [action.treeId]: action.new,
            },
          },
        },
      };
    default:
      return state;
  }
};

const reverseUndoableAction: ReverseActionFunc<UndoableContentChange> = action => {
  switch (action.type) {
    case 'setTree':
      return {
        ...action,
        old: action.new,
        new: action.old,
      };
    default:
      return action;
  }
};

export type ContentState = {
  plots: IdMap<UnpositionedPlot>;
};

export type UndoableContentState = UndoRedoHistory<UndoableContentChange, ContentState>;

const initialState: ContentState = {
  plots: {
    'plot': {
      trees: {
        'aa': {
          sentence: 'Noun verbs very adverbly.',
          nodes: {
            // 'a': {
            //   label: 'S', offset: { dTreeX: 0, dTreeY: 0 }, children: {
                'b': {
                  label: 'NP', offset: { dTreeX: 0, dTreeY: -10 }, children: {
                    'c': { label: 'N', offset: { dTreeX: 0, dTreeY: 0 }, slice: [0, 4], triangle: false },
                  }
                },
                'd': {
                  label: 'VP', offset: { dTreeX: 0, dTreeY: 0 }, children: {
                    'e': { label: 'V', offset: { dTreeX: 0, dTreeY: 0 }, slice: [5, 10], triangle: false },
                    'f': { label: 'AdvP', offset: { dTreeX: 0, dTreeY: 0 }, slice: [11, 24], triangle: true },
                  }
                },
            //   }
            // },
          },
          offset: { dPlotX: 200, dPlotY: 250 },
        },
      },
    },
  },
};

export const undoableInitialState: UndoableContentState = {
  current: initialState,
  undoStack: [],
  redoStack: [],
};

export const undoableReducer = (state: UndoableContentState, action: ContentAction | { type: 'undo' } | { type: 'redo' }): UndoableContentState =>
  action.type === 'undo' ? undo(applyUndoableAction)(reverseUndoableAction)(state)
    : action.type === 'redo' ? redo(applyUndoableAction)(reverseUndoableAction)(state)
    : applyToHistory(applyUndoableAction)({ ...makeUndoable(state.current)(action), timestamp: new Date() })(state);
