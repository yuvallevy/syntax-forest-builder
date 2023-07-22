import { useMemo, useState } from 'react';
import { filterEntries, mapEntries, transformValues } from '../../util/objTransforms';
import { NodeIndicatorInPlot } from '../../content/types';
import TreeView from './TreeView';
import SentenceView from './SentenceView';
import LabelNodeEditor from './LabelNodeEditor';
import { ClientCoords, ClientCoordsOffset, clientRectToPlotRect } from '../coords';
import { filterPositionedNodesInTree } from '../../content/positioned/positionedEntityHelpers';
import {
  applySelection, isNodeInRect, isNodeSelection, NodeSelectionMode, SelectionInPlot
} from '../selection';
import './PlotView.scss';
import { PositionedPlot } from '../../content/positioned/types';
import { applyNodePositionsToPlot } from '../../content/positioned/positioning';
import strWidth from '../strWidth';
import useUiState from '../useUiState';
import { PlotCoordsOffset } from '../../content/unpositioned/types';
import { generateTreeId } from '../content/generateId';

const PRIMARY_MOUSE_BUTTON = 1;
const MINIMUM_DRAG_DISTANCE = 8;  // to leave some wiggle room for the mouse to move while clicking

const PlotView: React.FC = () => {
  const { state, dispatch } = useUiState();

  const nothingSelected = isNodeSelection(state.selection) && state.selection.nodeIndicators.length === 0;
  const selectedNodeIndicators = isNodeSelection(state.selection) ? state.selection.nodeIndicators : [];
  const { editedNodeIndicator } = state;

  const plot: PositionedPlot = useMemo(() => {
    const unpositionedPlot = state.contentState.current.plots[state.activePlotIndex];
    return applyNodePositionsToPlot(strWidth)(unpositionedPlot);
  }, [state.contentState, state.activePlotIndex]);

  const setSelection = (newSelection: SelectionInPlot) => dispatch({ type: 'setSelection', newSelection });
  const moveNodes = (dx: number, dy: number) => dispatch({ type: 'moveSelectedNodes', dx, dy });
  const adoptNodes = (adoptedNodeIndicators: NodeIndicatorInPlot[]) =>
    dispatch({ type: 'adoptNodesBySelection', adoptedNodeIndicators });
  const disownNodes = (disownedNodeIndicators: NodeIndicatorInPlot[]) =>
    dispatch({ type: 'disownNodesBySelection', disownedNodeIndicators });

  const [dragStartCoords, setDragStartCoords] = useState<ClientCoords | undefined>();
  const [dragEndCoords, setDragEndCoords] = useState<ClientCoords | undefined>();
  const [mouseInteractionMode, setMouseInteractionMode] = useState<'idle' | 'selecting' | 'draggingNodes'>('idle');

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

  const addTreeAndFocus = (position: PlotCoordsOffset) => {
    const newTreeId = generateTreeId();
    dispatch({ type: 'addTree', newTreeId, offset: position });
    setTimeout(() =>
      (document.querySelector(`input#${newTreeId}`) as (HTMLInputElement | null))?.focus(), 50);
  };

  const handleNodesSelect = (nodeIndicators: NodeIndicatorInPlot[], mode: NodeSelectionMode = 'set') =>
    state.selectionAction === 'adopt' ? adoptNodes(nodeIndicators)
      : state.selectionAction === 'disown' ? disownNodes(nodeIndicators)
      : setSelection({ nodeIndicators: applySelection(mode, nodeIndicators, selectedNodeIndicators) });

  const handlePlotClick = (event: React.MouseEvent<SVGElement>) => {
    if (nothingSelected) {
      addTreeAndFocus({ dPlotX: event.clientX, dPlotY: event.clientY });
    } else {
      setSelection({ nodeIndicators: [] });
    }
  };

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
      if (dragEndCoords || xDistToDragStart > MINIMUM_DRAG_DISTANCE || yDistToDragStart > MINIMUM_DRAG_DISTANCE) {
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
      handleNodesSelect(newSelectedNodes, event.ctrlKey || event.metaKey ? 'add' : 'set');
    } else if (dragOffset && mouseInteractionMode === 'draggingNodes') {
      moveNodes(dragOffset.dClientX, dragOffset.dClientY);
    } else if (dragStartCoords && event.currentTarget === event.target) {
      handlePlotClick(event);
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

  const plotViewCursor = mouseInteractionMode === 'draggingNodes' && dragOffset ? 'move' : 'crosshair';

  return <>
    <svg
      className="PlotView--svg"
      width="100%"
      height="100%"
      style={{ cursor: plotViewCursor }}
      onMouseDown={handlePlotMouseDown}
      onMouseMove={handlePlotMouseMove}
      onMouseUp={handlePlotMouseUp}
    >
      {mapEntries(plot.trees, ([treeId, tree]) =>
        <TreeView
          key={`tree-${treeId}`}
          treeId={treeId}
          tree={tree}
          nodeDragOffset={mouseInteractionMode === 'draggingNodes' ? dragOffset : undefined}
          onNodeMouseDown={handleNodeMouseDown}
        />)}
      {selectionBoxTopLeft && selectionBoxBottomRight && <rect
        className="PlotView--selection-box"
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
        className={selectionBoxTopLeft && selectionBoxBottomRight ? 'box-selecting' : undefined}
      />)}
    {editedNodeIndicator && <LabelNodeEditor
      key={`editable-nodes-${editedNodeIndicator.nodeId}`}
      tree={plot.trees[editedNodeIndicator.treeId]}
      nodeId={editedNodeIndicator.nodeId}
    />}
  </>;
};

export default PlotView;
