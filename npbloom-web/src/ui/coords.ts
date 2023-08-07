import { CoordsInPlot, PositionedNode, PositionedTree } from 'npbloom-core';

type ClientX = number;
type ClientY = number;
type DClientX = number;
type DClientY = number;

export type ClientCoords = {
  clientX: ClientX;
  clientY: ClientY;
};

export type ClientCoordsOffset = {
  dClientX: DClientX;
  dClientY: DClientY;
}

export type ClientRect = {
  topLeft: ClientCoords;
  bottomRight: ClientCoords;
};

export type PlotRect = {
  topLeft: CoordsInPlot;
  bottomRight: CoordsInPlot;
};

// Calculate plot coords from client coords & vice versa, when they're different (when zoom and/or pan are implemented)

export const plotCoordsToClientCoords = (plotCoords: CoordsInPlot): ClientCoords => ({
  clientX: plotCoords.plotX,
  clientY: plotCoords.plotY,
});

export const clientCoordsToPlotCoords = (clientCoords: ClientCoords): CoordsInPlot => new CoordsInPlot(
  clientCoords.clientX,
  clientCoords.clientY,
);

export const clientRectToPlotRect = (clientRect: ClientRect): PlotRect => ({
  topLeft: clientCoordsToPlotCoords(clientRect.topLeft),
  bottomRight: clientCoordsToPlotCoords(clientRect.bottomRight),
});

/**
 * Returns the center coordinate of the given node in the given tree with respect to its containing plot.
 */
export const calculateNodeCenterOnPlot = (tree: PositionedTree) => (node: PositionedNode): CoordsInPlot => new CoordsInPlot(
  tree.position.plotX + node.position.treeX,
  tree.position.plotY + node.position.treeY - 9,
);
