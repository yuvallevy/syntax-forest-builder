import { PlotCoords, PositionedNode, PositionedTree } from '../content/positioned/types';

type ClientX = number;
type ClientY = number;

export type ClientCoords = {
  clientX: ClientX;
  clientY: ClientY;
};

export type ClientRect = {
  topLeft: ClientCoords;
  bottomRight: ClientCoords;
};

export type PlotRect = {
  topLeft: PlotCoords;
  bottomRight: PlotCoords;
};

// Calculate plot coords from client coords & vice versa, when they're different (when zoom and/or pan are implemented)

export const plotCoordsToClientCoords = (plotCoords: PlotCoords): ClientCoords => ({
  clientX: plotCoords.plotX,
  clientY: plotCoords.plotY,
});

export const clientCoordsToPlotCoords = (clientCoords: ClientCoords): PlotCoords => ({
  plotX: clientCoords.clientX,
  plotY: clientCoords.clientY,
});

export const clientRectToPlotRect = (clientRect: ClientRect): PlotRect => ({
  topLeft: clientCoordsToPlotCoords(clientRect.topLeft),
  bottomRight: clientCoordsToPlotCoords(clientRect.bottomRight),
});

/**
 * Returns the center coordinate of the given node in the given tree with respect to its containing plot.
 */
export const calculateNodeCenterOnPlot = (tree: PositionedTree) => (node: PositionedNode): PlotCoords => ({
  plotX: tree.position.plotX + node.position.treeX,
  plotY: tree.position.plotY + node.position.treeY - 9,
});
