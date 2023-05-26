import { union } from '../util/objTransforms';
import { Id, StringSlice, NodeIndicatorInPlot } from '../content/types';
import { calculateNodeCenterOnPlot, PlotRect } from './coords';
import { PlotCoords, PositionedNode, PositionedTree } from '../content/positioned/types';
import { UnpositionedPlot } from '../content/unpositioned/types';

export type NodeSelectionInPlot = { nodeIndicators: NodeIndicatorInPlot[] };
export type SliceSelectionInPlot = { treeId: Id, slice: StringSlice };
export type SelectionInPlot = NodeSelectionInPlot | SliceSelectionInPlot;

export const isNodeSelection = (selection: SelectionInPlot): selection is NodeSelectionInPlot => 'nodeIndicators' in selection;
export const isSliceSelection = (selection: SelectionInPlot): selection is SliceSelectionInPlot => 'slice' in selection;

export type NodeSelectionAction = 'select' | 'adopt' | 'disown';
export type NodeSelectionMode = 'set' | 'add';

export const applySelection = (
  mode: NodeSelectionMode, newNodeIndicators: NodeIndicatorInPlot[], existingNodeIndicators?: NodeIndicatorInPlot[]) =>
  mode === 'add' ? union(existingNodeIndicators || [], newNodeIndicators)
    : newNodeIndicators;

/**
 * Returns whether the node indicated by the given indicator exists in the given plot.
 */
const indicatorTargetExistsInPlot = (plot: UnpositionedPlot) => (nodeIndicator: NodeIndicatorInPlot) =>
  !!plot.trees[nodeIndicator.treeId] && !!plot.trees[nodeIndicator.treeId].nodes[nodeIndicator.nodeId];

/**
 * Returns a copy of the given node selection including only nodes matching the given predicate.
 */
const filterNodesInSelection = (
  selection: NodeSelectionInPlot,
  predicate: (nodeIndicator: NodeIndicatorInPlot) => boolean,
): SelectionInPlot =>
  ({ nodeIndicators: selection.nodeIndicators.filter(predicate) });

/**
 * Removes nonexistent nodes from the given selection, based on the given plot.
 */
export const pruneSelection = (selection: SelectionInPlot, plot: UnpositionedPlot): SelectionInPlot =>
  isSliceSelection(selection)
    ? (plot.trees[selection.treeId] ? selection : { nodeIndicators: [] })
    : filterNodesInSelection(selection, indicatorTargetExistsInPlot(plot));

/**
 * Returns whether the given point is inside the given rectangle.
 */
const isPointInPlotRect = (rect: PlotRect) => (coords: PlotCoords) =>
  coords.plotX >= rect.topLeft.plotX && coords.plotY >= rect.topLeft.plotY &&
  coords.plotX <= rect.bottomRight.plotX && coords.plotY <= rect.bottomRight.plotY;

export const isNodeInRect = (rect: PlotRect) => (tree: PositionedTree) => (node: PositionedNode) =>
  isPointInPlotRect(rect)(calculateNodeCenterOnPlot(tree)(node));
