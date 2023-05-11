import { union } from '../util/objTransforms';
import { Id, StringSlice, NodeIndicatorInPlot } from '../content/types';
import { calculateNodeCenterOnPlot, PlotRect } from './coords';
import { PlotCoords, PositionedNode, PositionedTree } from '../content/positioned/types';

export type NodeSelectionInPlot = { nodeIndicators: NodeIndicatorInPlot[] };
export type SliceSelectionInPlot = { treeId: Id, slice: StringSlice };
export type SelectionInPlot = NodeSelectionInPlot | SliceSelectionInPlot;

export const isNodeSelection = (selection: SelectionInPlot): selection is NodeSelectionInPlot => 'nodeIndicators' in selection;
export const isSliceSelection = (selection: SelectionInPlot): selection is SliceSelectionInPlot => 'slice' in selection;

export type NodeSelectionMode = 'SET' | 'ADD';

export const applySelection = (
  mode: NodeSelectionMode, newNodeIndicators: NodeIndicatorInPlot[], existingNodeIndicators?: NodeIndicatorInPlot[]) =>
  mode === 'ADD' ? union(existingNodeIndicators || [], newNodeIndicators)
    : newNodeIndicators;

/**
 * Returns whether the given point is inside the given rectangle.
 */
const isPointInPlotRect = (rect: PlotRect) => (coords: PlotCoords) =>
  coords.plotX >= rect.topLeft.plotX && coords.plotY >= rect.topLeft.plotY &&
  coords.plotX <= rect.bottomRight.plotX && coords.plotY <= rect.bottomRight.plotY;

export const isNodeInRect = (rect: PlotRect) => (tree: PositionedTree) => (node: PositionedNode) =>
  isPointInPlotRect(rect)(calculateNodeCenterOnPlot(tree)(node));
