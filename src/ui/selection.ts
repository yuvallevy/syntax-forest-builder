import { union } from '../core/objTransforms';
import { PlotCoords, PlotRect, PositionedNode, PositionedTree, TreeAndNodeId } from '../core/types';
import { calculateNodeCenterOnPlot } from './coords';

export type NodeSelectionMode = 'SET' | 'ADD';

export const applySelection = (mode: NodeSelectionMode, newIds: TreeAndNodeId[], existingIds?: TreeAndNodeId[]) =>
  mode === 'ADD' ? union(existingIds || [], newIds)
    : newIds;

/**
 * Returns whether the given point is inside the given rectangle.
 */
const isPointInPlotRect = (rect: PlotRect) => (coords: PlotCoords) =>
  coords.plotX >= rect.topLeft.plotX && coords.plotY >= rect.topLeft.plotY &&
  coords.plotX <= rect.bottomRight.plotX && coords.plotY <= rect.bottomRight.plotY;

export const isNodeInRect = (rect: PlotRect) => (tree: PositionedTree) => (node: PositionedNode) =>
  isPointInPlotRect(rect)(calculateNodeCenterOnPlot(tree)(node));
