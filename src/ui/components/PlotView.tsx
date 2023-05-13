import React, { useState } from 'react';
import { filterEntries, isEmpty, mapEntries, transformValues } from '../../util/objTransforms';
import { Id, StringSlice, Sentence, NodeIndicatorInPlot } from '../../content/types';
import TreeView from './TreeView';
import SentenceView from './SentenceView';
import LabelNodeEditor from './LabelNodeEditor';
import { ClientCoords, ClientCoordsOffset, clientRectToPlotRect } from '../coords';
import { filterPositionedNodesInTree } from '../../content/positioned/positionedEntityHelpers';
import { isNodeInRect, NodeSelectionMode } from '../selection';
import { NodeCreationTrigger } from '../nodeCreationTriggers';
import { PositionedPlot } from '../../content/positioned/types';
import './PlotView.scss';

const PRIMARY_MOUSE_BUTTON = 1;
const MINIMUM_DRAG_DISTANCE = 8;  // to leave some wiggle room for the mouse to move while clicking

interface PlotViewProps {
  plot: PositionedPlot;
  selectedNodeIndicators: NodeIndicatorInPlot[];
  editedNodeIndicator: NodeIndicatorInPlot | undefined;
  onClick: (event: React.MouseEvent<SVGElement>) => void;
  onNodesSelect: (nodeIndicators: NodeIndicatorInPlot[], mode: NodeSelectionMode) => void;
  onSliceSelect: (treeId: Id, slice: StringSlice) => void;
  onNodeMove: (dx: number, dy: number) => void;
  onNodeCreationTriggerClick: (treeId: Id, trigger: NodeCreationTrigger) => void;
  onSentenceBlur: (treeId: Id, event: React.FocusEvent<HTMLInputElement>) => void;
  onSentenceChange: (treeId: Id, newSentence: Sentence, oldSelection: StringSlice) => void;
  onSentenceKeyDown: (treeId: Id, event: React.KeyboardEvent<HTMLInputElement>) => void;
  onNodeEditorBlur: (event: React.FocusEvent<HTMLInputElement>) => void;
  onNodeEditorKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
}

const PlotView: React.FC<PlotViewProps> = ({
  plot,
  selectedNodeIndicators,
  editedNodeIndicator,
  onClick,
  onNodesSelect,
  onSliceSelect,
  onNodeMove,
  onNodeCreationTriggerClick,
  onSentenceBlur,
  onSentenceChange,
  onSentenceKeyDown,
  onNodeEditorBlur,
  onNodeEditorKeyDown,
}) => {
  const [dragStartCoords, setDragStartCoords] = useState<ClientCoords | undefined>();
  const [dragEndCoords, setDragEndCoords] = useState<ClientCoords | undefined>();
  const [mouseInteractionMode, setMouseInteractionMode] = useState<'idle' | 'selecting' | 'draggingNodes'>('idle');

  const selectedNodeIds = selectedNodeIndicators.map(({ nodeId }) => nodeId);

  const selectionBoxTopLeft: ClientCoords | undefined = mouseInteractionMode === 'selecting' && dragStartCoords && dragEndCoords ? {
    clientX: Math.min(dragStartCoords.clientX, dragEndCoords.clientX),
    clientY: Math.min(dragStartCoords.clientY, dragEndCoords.clientY),
  } : undefined;

  const selectionBoxBottomRight: ClientCoords | undefined = mouseInteractionMode === 'selecting' && dragStartCoords && dragEndCoords ? {
    clientX: Math.max(dragStartCoords.clientX, dragEndCoords.clientX),
    clientY: Math.max(dragStartCoords.clientY, dragEndCoords.clientY),
  } : undefined;

  const dragOffset: ClientCoordsOffset | undefined = dragStartCoords && dragEndCoords ? {
    dClientX: dragEndCoords.clientX - dragStartCoords.clientX,
    dClientY: dragEndCoords.clientY - dragStartCoords.clientY,
  } : undefined;

  const handlePlotMouseDown = (event: React.MouseEvent<SVGElement>) => {
    if (event.currentTarget === event.target) {  // Only start a selection box from an empty area
      setMouseInteractionMode('selecting');
      setDragStartCoords({ clientX: event.clientX, clientY: event.clientY });
    }
  };

  const handlePlotMouseMove = (event: React.MouseEvent<SVGElement>) => {
    if (event.buttons === PRIMARY_MOUSE_BUTTON && dragStartCoords) {
      const xDistToDragStart = Math.abs(dragStartCoords?.clientX - event.clientX);
      const yDistToDragStart = Math.abs(dragStartCoords?.clientY - event.clientY);
      if (xDistToDragStart > MINIMUM_DRAG_DISTANCE || yDistToDragStart > MINIMUM_DRAG_DISTANCE) {
        setDragEndCoords({ clientX: event.clientX, clientY: event.clientY });
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
          [] as NodeIndicatorInPlot[]);
      onNodesSelect(newSelectedNodes, event.ctrlKey || event.metaKey ? 'ADD' : 'SET');
    } else if (dragOffset && mouseInteractionMode === 'draggingNodes') {
      onNodeMove(dragOffset.dClientX, dragOffset.dClientY);
    } else if (dragStartCoords && event.currentTarget === event.target) {
      onClick(event);
    }
    setDragStartCoords(undefined);
    setDragEndCoords(undefined);
    setMouseInteractionMode('idle');
  };

  const handleNodeMouseDown = (event: React.MouseEvent<SVGElement>) => {
    if (event.buttons === PRIMARY_MOUSE_BUTTON) {
      setMouseInteractionMode('draggingNodes');
      setDragStartCoords({ clientX: event.clientX, clientY: event.clientY });
    }
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
          nodeDragOffset={mouseInteractionMode === 'draggingNodes' ? dragOffset : undefined}
          onNodeMouseDown={handleNodeMouseDown}
          onSingleNodeSelect={(nodeId, mode) => onNodesSelect([{ treeId, nodeId }], mode)}
          onNodeCreationTriggerClick={trigger => onNodeCreationTriggerClick(treeId, trigger)}
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
        onBlur={event => onSentenceBlur(treeId, event)}
        onChange={(newSentence, oldSelection) => onSentenceChange(treeId, newSentence, oldSelection)}
        onSelect={slice => onSliceSelect(treeId, slice)}
        onKeyDown={event => onSentenceKeyDown(treeId, event)}
      />)}
    {editedNodeIndicator && <LabelNodeEditor
      key={`editable-nodes-${editedNodeIndicator.nodeId}`}
      tree={plot.trees[editedNodeIndicator.treeId]}
      nodeId={editedNodeIndicator.nodeId}
      onBlur={onNodeEditorBlur}
      onKeyDown={onNodeEditorKeyDown}
    />}
  </>;
};

export default PlotView;
