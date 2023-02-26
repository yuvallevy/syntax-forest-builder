import { PlotCoords } from '../core/types';
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
