import React, { useState } from 'react';
import { filterEntries, flatten, mapEntries, transformValues } from '../core/objTransforms';
import { Id, PlotRect, PositionedPlot } from '../core/types';
import TreeView from './TreeView';
import SentenceView from './SentenceView';
import ClientCoords, { ClientRect } from './ClientCoords';
import './PlotView.scss';
import { filterPositionedNodesInTree, isNodeInRect } from '../mantle/positionedEntityHelpers';

const PRIMARY_MOUSE_BUTTON = 1;

const clientRectToPlotRect = (clientRect: ClientRect): PlotRect => ({
  // Calculate plot coords from client coords, when they're different (when zoom and/or pan are implemented)
  topLeft: {
    plotX: clientRect.topLeft.clientX,
    plotY: clientRect.topLeft.clientY,
  },
  bottomRight: {
    plotX: clientRect.bottomRight.clientX,
    plotY: clientRect.bottomRight.clientY,
  },
});

interface PlotViewProps {
  plot: PositionedPlot;
  selectedNodeIds: Id[];
  onNodesSelect: (treeIds: Id[], nodeIds: Id[]) => void;
}

const PlotView: React.FC<PlotViewProps> = ({ plot, selectedNodeIds, onNodesSelect }) => {
  const [selectionBoxStart, setSelectionBoxStart] = useState<ClientCoords | undefined>();
  const [selectionBoxEnd, setSelectionBoxEnd] = useState<ClientCoords | undefined>();

  const selectionBoxTopLeft: ClientCoords | undefined = selectionBoxStart && selectionBoxEnd ? {
    clientX: Math.min(selectionBoxStart.clientX, selectionBoxEnd.clientX),
    clientY: Math.min(selectionBoxStart.clientY, selectionBoxEnd.clientY),
  } : undefined;

  const selectionBoxBottomRight: ClientCoords | undefined = selectionBoxStart && selectionBoxEnd ? {
    clientX: Math.max(selectionBoxStart.clientX, selectionBoxEnd.clientX),
    clientY: Math.max(selectionBoxStart.clientY, selectionBoxEnd.clientY),
  } : undefined;

  const handlePlotMouseDown = (event: React.MouseEvent<SVGElement>) => {
    if (event.currentTarget === event.target) {  // Only start a selection box from an empty area
      setSelectionBoxStart({ clientX: event.clientX, clientY: event.clientY });
      setSelectionBoxEnd({ clientX: event.clientX, clientY: event.clientY });
    }
  };

  const handlePlotMouseMove = (event: React.MouseEvent<SVGElement>) => {
    if (event.buttons === PRIMARY_MOUSE_BUTTON) {
      setSelectionBoxEnd({ clientX: event.clientX, clientY: event.clientY });
    }
  };

  const handlePlotMouseUp = (event: React.MouseEvent<SVGElement>) => {
    if (selectionBoxTopLeft && selectionBoxBottomRight) {
      const plotRect = clientRectToPlotRect({ topLeft: selectionBoxTopLeft, bottomRight: selectionBoxBottomRight });
      const nodeInRectPredicate = isNodeInRect(plotRect);
      const newSelectedNodeIdsByTree = filterEntries(
        transformValues(
          plot.trees,
          tree => Object.keys(filterPositionedNodesInTree(nodeInRectPredicate(tree))(tree))
        ),
        ([_, nodeIds]) => nodeIds.length > 0
      );
      const newSelectedTreeIds = Object.keys(newSelectedNodeIdsByTree);
      const newSelectedNodeIds = flatten(Object.values(newSelectedNodeIdsByTree));
      onNodesSelect(newSelectedTreeIds, newSelectedNodeIds);
    }
    setSelectionBoxStart(undefined);
    setSelectionBoxEnd(undefined);
  };

  return <>
    <svg
      className="PlotView-svg"
      width="100%"
      height="100%"
      onMouseDown={handlePlotMouseDown}
      onMouseMove={handlePlotMouseMove}
      onMouseUp={handlePlotMouseUp}
    >
      {mapEntries(plot.trees, ([treeId, tree]) =>
        <TreeView
          key={`tree-${treeId}`}
          treeId={treeId}
          tree={tree}
          selectedNodeIds={selectedNodeIds}
          onSingleNodeSelect={nodeId => onNodesSelect([treeId], [nodeId])}
        />)}
      {selectionBoxTopLeft && selectionBoxBottomRight && <rect
        className="PlotView-selection-box"
        x={selectionBoxTopLeft.clientX}
        y={selectionBoxTopLeft.clientY}
        width={selectionBoxBottomRight.clientX - selectionBoxTopLeft.clientX}
        height={selectionBoxBottomRight.clientY - selectionBoxTopLeft.clientY}
      />}
    </svg>
    {mapEntries(plot.trees, ([treeId, tree]) => <SentenceView key={`sentence-${treeId}`} tree={tree} onChange={console.log} />)}
  </>;
};

export default PlotView;
