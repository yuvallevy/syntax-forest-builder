import {
  Id, IdMap, StringSlice, Sentence, NodeIndicatorInPlot
} from '../../content/types';
import {
  InsertedNode, insertNodeIntoTree, transformNodeInTree, transformNodesInTree
} from '../../content/unpositioned/manipulation';
import { deleteNodesInPlot, transformNodesInPlot } from '../../content/unpositioned/plotManipulation';
import UndoRedoHistory, { ApplyActionFunc, applyToHistory, redo, ReverseActionFunc, undo, UndoableActionCommon } from '../../util/UndoRedoHistory';
import { handleLocalSentenceChange } from './editNodes';
import { omitKey } from '../../util/objTransforms';
import {
  isTerminal, PlotCoordsOffset, UnpositionedPlot, UnpositionedTree
} from '../../content/unpositioned/types';

/**
 * Represents an action taken by the user.
 * To integrate with the undo/redo system, each action is translated into an undoable "state change",
 * which is subsequently applied in a reversible fashion.
 */
export type ContentAction =
  | { type: 'insertNode', plotId: Id, treeId: Id, newNodeId: Id, newNode: InsertedNode }
  | { type: 'deleteNodes', plotId: Id, nodeIndicators: NodeIndicatorInPlot[] }
  | { type: 'moveNodes', plotId: Id, nodeIndicators: NodeIndicatorInPlot[], dx: number, dy: number }
  | { type: 'setNodeLabel', plotId: Id, nodeIndicator: NodeIndicatorInPlot, newLabel: string }
  | { type: 'setTriangle', plotId: Id, nodeIndicators: NodeIndicatorInPlot[], triangle: boolean }
  | { type: 'setSentence', plotId: Id, treeId: Id, newSentence: Sentence, oldSelectedSlice: StringSlice }
  | { type: 'addTree', plotId: Id, newTreeId: Id, offset: PlotCoordsOffset }
  | { type: 'removeTree', plotId: Id, treeId: Id }
;

/**
 * Represents a change in state as a result of an action done by the user.
 * Each state change includes information about the state before it so it can be easily undone,
 * and each action by the user is translated into a state change so that undo/redo can work smoothly.
 */
type ContentChange = (
  | { type: 'setPlot', plotId: Id, old: UnpositionedPlot, new: UnpositionedPlot }
  | { type: 'setTree', plotId: Id, treeId: Id, old: UnpositionedTree, new: UnpositionedTree }
  | { type: 'addTree', plotId: Id, newTreeId: Id, newTree: UnpositionedTree }
  | { type: 'removeTree', plotId: Id, treeId: Id, removedTree: UnpositionedTree }
);

type UndoableContentChange = UndoableActionCommon & ContentChange;

/**
 * Translates a user action into a state change, which can later be undone.
 */
const makeUndoable = (state: ContentState) => (action: ContentAction): ContentChange => {
  switch (action.type) {
    case 'insertNode': {
      return {
        type: 'setTree',
        plotId: action.plotId,
        treeId: action.treeId,
        old: state.plots[action.plotId].trees[action.treeId],
        new: insertNodeIntoTree(action.newNode)(action.newNodeId)(state.plots[action.plotId].trees[action.treeId]),
      };
    }
    case 'deleteNodes': {
      return {
        type: 'setPlot',
        plotId: action.plotId,
        old: state.plots[action.plotId],
        new: deleteNodesInPlot(action.nodeIndicators)(state.plots[action.plotId]),
      };
    }
    case 'moveNodes': {
      return {
        type: 'setPlot',
        plotId: action.plotId,
        old: state.plots[action.plotId],
        new: transformNodesInPlot(node => ({
          ...node,
          offset: { dTreeX: node.offset.dTreeX + action.dx, dTreeY: node.offset.dTreeY + action.dy }
        }))(action.nodeIndicators)(state.plots[action.plotId]),
      }
    }
    case 'setNodeLabel': {
      return {
        type: 'setTree',
        plotId: action.plotId,
        treeId: action.nodeIndicator.treeId,
        old: state.plots[action.plotId].trees[action.nodeIndicator.treeId],
        new: transformNodeInTree(node => ({ ...node, label: action.newLabel }))(action.nodeIndicator.nodeId)(
          state.plots[action.plotId].trees[action.nodeIndicator.treeId]),
      };
    }
    case 'setTriangle': {
      const treeId = action.nodeIndicators[0].treeId;  // TODO: Use all trees
      const nodeIds = action.nodeIndicators
        .filter(nodeIndicator => nodeIndicator.treeId === treeId).map(nodeIndicator => nodeIndicator.nodeId);
      return {
        type: 'setTree',
        plotId: action.plotId,
        treeId,
        old: state.plots[action.plotId].trees[treeId],
        new: transformNodesInTree(node => isTerminal(node) ? { ...node, triangle: action.triangle } : node)(nodeIds)(
          state.plots[action.plotId].trees[treeId]),
      };
    }
    case 'setSentence': {
      return {
        type: 'setTree',
        plotId: action.plotId,
        treeId: action.treeId,
        old: state.plots[action.plotId].trees[action.treeId],
        new: handleLocalSentenceChange(action.newSentence, action.oldSelectedSlice)(
          state.plots[action.plotId].trees[action.treeId]),
      };
    }
    case 'addTree': {
      return {
        type: 'addTree',
        plotId: action.plotId,
        newTreeId: action.newTreeId,
        newTree: {
          nodes: {},
          sentence: '',
          offset: action.offset,
        },
      };
    }
    case 'removeTree': {
      return {
        ...action,
        removedTree: state.plots[action.plotId].trees[action.treeId],
      };
    }
  }
};

const applyUndoableAction: ApplyActionFunc<UndoableContentChange, ContentState> = action => state => {
  switch (action.type) {
    case 'setPlot': {
      return {
        ...state,
        plots: {
          ...state.plots,
          [action.plotId]: action.new,
        },
      };
    }
    case 'setTree': {
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
    }
    case 'addTree': {
      return {
        ...state,
        plots: {
          ...state.plots,
          [action.plotId]: {
            ...state.plots[action.plotId],
            trees: {
              ...state.plots[action.plotId].trees,
              [action.newTreeId]: action.newTree,
            },
          },
        },
      };
    }
    case 'removeTree': {
      return {
        ...state,
        plots: {
          ...state.plots,
          [action.plotId]: {
            ...state.plots[action.plotId],
            trees: omitKey(state.plots[action.plotId].trees, action.treeId)
          },
        },
      };
    }
    default:
      return state;
  }
};

const reverseUndoableAction: ReverseActionFunc<UndoableContentChange> = action => {
  switch (action.type) {
    case 'setPlot': {
      return {
        ...action,
        old: action.new,
        new: action.old,
      };
    }
    case 'setTree': {
      return {
        ...action,
        old: action.new,
        new: action.old,
      };
    }
    case 'addTree': {
      return {
        ...action,
        type: 'removeTree',
        plotId: action.plotId,
        treeId: action.newTreeId,
        removedTree: action.newTree,
      };
    }
    case 'removeTree': {
      return {
        ...action,
        type: 'addTree',
        plotId: action.plotId,
        newTreeId: action.treeId,
        newTree: action.removedTree,
      };
    }
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
      trees: {},
    },
  },
};

export const initialContentState: UndoableContentState = {
  current: initialState,
  undoStack: [],
  redoStack: [],
};

export const contentReducer = (state: UndoableContentState, action: ContentAction | { type: 'undo' } | { type: 'redo' }): UndoableContentState =>
  action.type === 'undo' ? undo(applyUndoableAction)(reverseUndoableAction)(state)
    : action.type === 'redo' ? redo(applyUndoableAction)(state)
    : applyToHistory(applyUndoableAction)({ ...makeUndoable(state.current)(action), timestamp: new Date() })(state);
