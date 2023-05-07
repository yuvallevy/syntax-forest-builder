import React, { useState } from 'react';
import { filterEntries, isEmpty, mapEntries, transformValues } from '../core/objTransforms';
import { Id, StringSlice, PlotRect, PositionedPlot, Sentence, TreeAndNodeId } from '../core/types';
import TreeView from './TreeView';
import SentenceView from './SentenceView';
import LabelNodeEditor from './LabelNodeEditor';
import ClientCoords, { ClientRect } from './ClientCoords';
import './PlotView.scss';
import { filterPositionedNodesInTree } from '../mantle/positionedEntityHelpers';
import { clientCoordsToPlotCoords } from './coords';
import { isNodeInRect, NodeSelectionMode } from './selection';

const PRIMARY_MOUSE_BUTTON = 1;
const MINIMUM_SELECTION_BOX_DIMENSION = 8;  // to leave some wiggle room for the mouse to move while clicking

const clientRectToPlotRect = (clientRect: ClientRect): PlotRect => ({
  topLeft: clientCoordsToPlotCoords(clientRect.topLeft),
  bottomRight: clientCoordsToPlotCoords(clientRect.bottomRight),
});

interface PlotViewProps {
  plot: PositionedPlot;
  selectedNodes: TreeAndNodeId[];
  editing: TreeAndNodeId | undefined;
  onClick: (event: React.MouseEvent<SVGElement>) => void;
  onNodesSelect: (nodes: TreeAndNodeId[], mode: NodeSelectionMode) => void;
  onSliceSelect: (treeId: Id, slice: StringSlice) => void;
  onSentenceChange: (treeId: Id, newSentence: Sentence, oldSelection: StringSlice) => void;
  onSentenceKeyDown: (treeId: Id, event: React.KeyboardEvent<HTMLInputElement>) => void;
  onNodeEditorBlur: (event: React.FocusEvent<HTMLInputElement>) => void;
  onNodeEditorKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
}

const PlotView: React.FC<PlotViewProps> = ({
  plot,
  selectedNodes,
  editing,
  onClick,
  onNodesSelect,
  onSliceSelect,
  onSentenceChange,
  onSentenceKeyDown,
  onNodeEditorBlur,
  onNodeEditorKeyDown,
}) => {
  const [selectionBoxStart, setSelectionBoxStart] = useState<ClientCoords | undefined>();
  const [selectionBoxEnd, setSelectionBoxEnd] = useState<ClientCoords | undefined>();

  const selectedNodeIds = selectedNodes.map(({ nodeId }) => nodeId);

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
    }
  };

  const handlePlotMouseMove = (event: React.MouseEvent<SVGElement>) => {
    if (event.buttons === PRIMARY_MOUSE_BUTTON && selectionBoxStart) {
      const xDistToSelectionBoxStart = Math.abs(selectionBoxStart?.clientX - event.clientX);
      const yDistToSelectionBoxStart = Math.abs(selectionBoxStart?.clientY - event.clientY);
      if (xDistToSelectionBoxStart > MINIMUM_SELECTION_BOX_DIMENSION ||
        yDistToSelectionBoxStart > MINIMUM_SELECTION_BOX_DIMENSION) {
        setSelectionBoxEnd({ clientX: event.clientX, clientY: event.clientY });
      }
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
      const newSelectedNodes = Object.entries(newSelectedNodeIdsByTree)
        .reduce(
          (nodes, [treeId, nodeIds]) => [...nodes, ...nodeIds.map(nodeId => ({ treeId, nodeId }))],
          [] as TreeAndNodeId[]);
      onNodesSelect(newSelectedNodes, event.ctrlKey || event.metaKey ? 'ADD' : 'SET');
    } else if (selectionBoxStart) {
      onClick(event);
    }
    setSelectionBoxStart(undefined);
    setSelectionBoxEnd(undefined);
  };

  return <>
    {isEmpty(plot.trees) && <div className="PlotView-placeholder">Click anywhere and type a sentence...</div>}
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
          onSingleNodeSelect={(nodeId, mode) => onNodesSelect([{ treeId, nodeId }], mode)}
        />)}
      {selectionBoxTopLeft && selectionBoxBottomRight && <rect
        className="PlotView-selection-box"
        x={selectionBoxTopLeft.clientX}
        y={selectionBoxTopLeft.clientY}
        width={selectionBoxBottomRight.clientX - selectionBoxTopLeft.clientX}
        height={selectionBoxBottomRight.clientY - selectionBoxTopLeft.clientY}
      />}
    </svg>
    {mapEntries(plot.trees, ([treeId, tree]) =>
      <SentenceView
        key={`sentence-${treeId}`}
        tree={tree}
        treeId={treeId}
        onChange={(newSentence, oldSelection) => onSentenceChange(treeId, newSentence, oldSelection)}
        onSelect={slice => onSliceSelect(treeId, slice)}
        onKeyDown={event => onSentenceKeyDown(treeId, event)}
      />)}
    {editing && <LabelNodeEditor
      key={`editable-nodes-${editing.nodeId}`}
      tree={plot.trees[editing.treeId]}
      nodeId={editing.nodeId}
      onBlur={onNodeEditorBlur}
      onKeyDown={onNodeEditorKeyDown}
    />}
  </>;
};

export default PlotView;
