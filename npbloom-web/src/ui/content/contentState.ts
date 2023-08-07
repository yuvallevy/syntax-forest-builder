import {
  idMap, InsertedNode, NodeIndicatorInPlot, PlotCoordsOffset, set, StringSlice, TreeCoordsOffset, UnpositionedPlot,
  UnpositionedTerminalNode, UnpositionedTree
} from 'npbloom-core';
import UndoRedoHistory, {
  ApplyActionFunc, applyToHistory, redo, ReverseActionFunc, undo, UndoableActionCommon
} from '../../util/UndoRedoHistory';
import { handleLocalSentenceChange } from './editNodes';
import { changeAt, insertAt, removeAt } from '../../util/objTransforms';
import { Id, PlotIndex, Sentence } from '../../types';

/**
 * Represents an action taken by the user.
 * To integrate with the undo/redo system, each action is translated into an undoable "state change",
 * which is subsequently applied in a reversible fashion.
 */
export type ContentAction =
  | { type: 'addPlot' }
  | { type: 'deletePlot', plotIndex: PlotIndex }
  | { type: 'resetPlot', plotIndex: PlotIndex }
  | { type: 'insertNode', plotIndex: PlotIndex, treeId: Id, newNodeId: Id, newNode: InsertedNode }
  | { type: 'deleteNodes', plotIndex: PlotIndex, nodeIndicators: NodeIndicatorInPlot[] }
  | { type: 'adoptNodes', plotIndex: PlotIndex, treeId: Id, adoptingNodeId: Id, adoptedNodeIds: Id[] }
  | { type: 'disownNodes', plotIndex: PlotIndex, treeId: Id, disowningNodeId: Id, disownedNodeIds: Id[] }
  | { type: 'moveNodes', plotIndex: PlotIndex, nodeIndicators: NodeIndicatorInPlot[], dx: number, dy: number }
  | { type: 'resetNodePositions', plotIndex: PlotIndex, nodeIndicators: NodeIndicatorInPlot[] }
  | { type: 'setNodeLabel', plotIndex: PlotIndex, nodeIndicator: NodeIndicatorInPlot, newLabel: string }
  | { type: 'setTriangle', plotIndex: PlotIndex, nodeIndicators: NodeIndicatorInPlot[], triangle: boolean }
  | { type: 'setSentence', plotIndex: PlotIndex, treeId: Id, newSentence: Sentence, oldSelectedSlice: StringSlice }
  | { type: 'addTree', plotIndex: PlotIndex, newTreeId: Id, offset: PlotCoordsOffset }
  | { type: 'removeTree', plotIndex: PlotIndex, treeId: Id }
;

/**
 * Represents a change in state as a result of an action done by the user.
 * Each state change includes information about the state before it so it can be easily undone,
 * and each action by the user is translated into a state change so that undo/redo can work smoothly.
 */
type ContentChange = (
  | { type: 'setPlot', plotIndex: PlotIndex, old: UnpositionedPlot, new: UnpositionedPlot }
  | { type: 'addPlot', newPlotIndex: PlotIndex, newPlot: UnpositionedPlot }
  | { type: 'removePlot', plotIndex: PlotIndex, removedPlot: UnpositionedPlot }
  | { type: 'setTree', plotIndex: PlotIndex, treeId: Id, old: UnpositionedTree, new: UnpositionedTree }
  | { type: 'addTree', plotIndex: PlotIndex, newTreeId: Id, newTree: UnpositionedTree }
  | { type: 'removeTree', plotIndex: PlotIndex, treeId: Id, removedTree: UnpositionedTree }
);

type UndoableContentChange = UndoableActionCommon & ContentChange;

/**
 * Translates a user action into a state change, which can later be undone.
 */
const makeUndoable = (state: ContentState) => (action: ContentAction): ContentChange => {
  switch (action.type) {
    case 'addPlot': {
      return {
        type: 'addPlot',
        newPlotIndex: state.plots.length,
        newPlot: new UnpositionedPlot(),
      };
    }
    case 'deletePlot': {
      return {
        type: 'removePlot',
        plotIndex: action.plotIndex,
        removedPlot: state.plots[action.plotIndex],
      };
    }
    case 'resetPlot': {
      return {
        type: 'setPlot',
        plotIndex: action.plotIndex,
        old: state.plots[action.plotIndex],
        new: new UnpositionedPlot(),
      };
    }
    case 'insertNode': {
      return {
        type: 'setTree',
        plotIndex: action.plotIndex,
        treeId: action.treeId,
        old: state.plots[action.plotIndex].tree(action.treeId),
        new: state.plots[action.plotIndex].tree(action.treeId).insertNode(action.newNode, action.newNodeId),
      };
    }
    case 'deleteNodes': {
      return {
        type: 'setPlot',
        plotIndex: action.plotIndex,
        old: state.plots[action.plotIndex],
        new: state.plots[action.plotIndex].deleteNodes(set(action.nodeIndicators)),
      };
    }
    case 'adoptNodes': {
      return {
        type: 'setTree',
        plotIndex: action.plotIndex,
        treeId: action.treeId,
        old: state.plots[action.plotIndex].tree(action.treeId),
        new: state.plots[action.plotIndex].tree(action.treeId).adoptNodes(
          action.adoptingNodeId, set(action.adoptedNodeIds)),
      };
    }
    case 'disownNodes': {
      return {
        type: 'setTree',
        plotIndex: action.plotIndex,
        treeId: action.treeId,
        old: state.plots[action.plotIndex].tree(action.treeId),
        new: state.plots[action.plotIndex].tree(action.treeId).disownNodes(
          action.disowningNodeId, set(action.disownedNodeIds),),
      };
    }
    case 'moveNodes': {
      return {
        type: 'setPlot',
        plotIndex: action.plotIndex,
        old: state.plots[action.plotIndex],
        new: state.plots[action.plotIndex].transformNodes(
          node => node.changeOffset(new TreeCoordsOffset(action.dx, action.dy)),
          set(action.nodeIndicators),
        ),
      }
    }
    case 'resetNodePositions': {
      return {
        type: 'setPlot',
        plotIndex: action.plotIndex,
        old: state.plots[action.plotIndex],
        new: state.plots[action.plotIndex].transformNodes(
          node => node.withOffset(TreeCoordsOffset.Companion.ZERO),
          set(action.nodeIndicators),
        ),
      };
    }
    case 'setNodeLabel': {
      return {
        type: 'setTree',
        plotIndex: action.plotIndex,
        treeId: action.nodeIndicator.treeId,
        old: state.plots[action.plotIndex].tree(action.nodeIndicator.treeId),
        new: state.plots[action.plotIndex].tree(action.nodeIndicator.treeId).transformNode(
          action.nodeIndicator.nodeId,
          node => node.withLabel(action.newLabel),
        ),
      };
    }
    case 'setTriangle': {
      const treeId = action.nodeIndicators[0].treeId;  // TODO: Use all trees
      const nodeIds = action.nodeIndicators
        .filter(nodeIndicator => nodeIndicator.treeId === treeId).map(nodeIndicator => nodeIndicator.nodeId);
      return {
        type: 'setTree',
        plotIndex: action.plotIndex,
        treeId,
        old: state.plots[action.plotIndex].tree(treeId),
        new: state.plots[action.plotIndex].tree(treeId).transformNodes(
          set(nodeIds),
          node =>
            node instanceof UnpositionedTerminalNode
              ? new UnpositionedTerminalNode(node.label, node.offset, node.slice, action.triangle)
              : node,
        ),
      };
    }
    case 'setSentence': {
      return {
        type: 'setTree',
        plotIndex: action.plotIndex,
        treeId: action.treeId,
        old: state.plots[action.plotIndex].trees[action.treeId],
        new: handleLocalSentenceChange(action.newSentence, action.oldSelectedSlice)(
          state.plots[action.plotIndex].tree(action.treeId)),
      };
    }
    case 'addTree': {
      return {
        type: 'addTree',
        plotIndex: action.plotIndex,
        newTreeId: action.newTreeId,
        newTree: new UnpositionedTree('', idMap({}), action.offset),
      };
    }
    case 'removeTree': {
      return {
        ...action,
        removedTree: state.plots[action.plotIndex].trees[action.treeId],
      };
    }
  }
};

const applyUndoableAction: ApplyActionFunc<UndoableContentChange, ContentState> = action => state => {
  switch (action.type) {
    case 'setPlot': {
      return {
        ...state,
        plots: changeAt(state.plots, action.plotIndex, action.new),
      };
    }
    case 'addPlot': {
      return {
        ...state,
        plots: insertAt(state.plots, action.newPlotIndex, action.newPlot),
      };
    }
    case 'removePlot': {
      return {
        ...state,
        plots: removeAt(state.plots, action.plotIndex),
      }
    }
    case 'setTree': {
      const currentPlot = state.plots[action.plotIndex];
      const newPlot = currentPlot.setTree(action.treeId, action.new);
      return {
        ...state,
        plots: changeAt(state.plots, action.plotIndex, newPlot),
      };
    }
    case 'addTree': {
      const currentPlot = state.plots[action.plotIndex];
      const newPlot = currentPlot.setTree(action.newTreeId, action.newTree);
      return {
        ...state,
        plots: changeAt(state.plots, action.plotIndex, newPlot),
      };
    }
    case 'removeTree': {
      const currentPlot = state.plots[action.plotIndex];
      const newPlot = currentPlot.removeTree(action.treeId);
      return {
        ...state,
        plots: changeAt(state.plots, action.plotIndex, newPlot),
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
    case 'addPlot': {
      return {
        ...action,
        type: 'removePlot',
        plotIndex: action.newPlotIndex,
        removedPlot: action.newPlot || { trees: {} },
      };
    }
    case 'removePlot': {
      return {
        ...action,
        type: 'addPlot',
        newPlotIndex: action.plotIndex,
        newPlot: action.removedPlot,
      }
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
        plotIndex: action.plotIndex,
        treeId: action.newTreeId,
        removedTree: action.newTree,
      };
    }
    case 'removeTree': {
      return {
        ...action,
        type: 'addTree',
        plotIndex: action.plotIndex,
        newTreeId: action.treeId,
        newTree: action.removedTree,
      };
    }
    default:
      return action;
  }
};

export type ContentState = {
  plots: UnpositionedPlot[];
};

export type UndoableContentState = UndoRedoHistory<UndoableContentChange, ContentState>;

const initialState: ContentState = {
  plots: [new UnpositionedPlot()],
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
