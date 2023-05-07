import { PlotCoords, PositionedNode, PositionedTree } from '../core/types';
import ClientCoords from './ClientCoords';

// Calculate plot coords from client coords & vice versa, when they're different (when zoom and/or pan are implemented)

export const plotCoordsToClientCoords = (plotCoords: PlotCoords): ClientCoords => ({
  clientX: plotCoords.plotX,
  clientY: plotCoords.plotY,
});

export const clientCoordsToPlotCoords = (clientCoords: ClientCoords): PlotCoords => ({
  plotX: clientCoords.clientX,
  plotY: clientCoords.clientY,
});

/**
 * Returns the center coordinate of the given node in the given tree with respect to its containing plot.
 */
export const calculateNodeCenterOnPlot = (tree: PositionedTree) => (node: PositionedNode): PlotCoords => ({
  plotX: tree.position.plotX + node.position.treeX,
  plotY: tree.position.plotY + node.position.treeY - 9,
});
