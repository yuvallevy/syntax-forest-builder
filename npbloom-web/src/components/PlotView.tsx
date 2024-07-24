import { useContext, useMemo, useState } from 'react';
import {
  AddTree, AddTreeFromLbn, AdoptNodesBySelection, applyNodePositionsToPlot, applyNodeSelection, ClientCoordsOffset,
  CoordsInPlot, CoordsInClient, DisownNodesBySelection, EntitySelectionAction, EntitySelectionMode, generateTreeId,
  isNodeInRect, MoveSelectedNodes, MoveSelectedTrees, NodeIndicatorInPlot, NodeSelectionInPlot, NoSelectionInPlot, Pan,
  PositionedPlot, RectInClient, SelectionInPlot, SetSelection, Zoom
} from 'npbloom-core';
import TreeView from './TreeView';
import SentenceView from './SentenceView';
import LabelNodeEditor from './LabelNodeEditor';
import ZoomControl from "./ZoomControl.tsx";
import './PlotView.scss';
import useUiState from '../useUiState';
import SettingsStateContext from '../SettingsStateContext';
import { SVG_X, SVG_Y } from '../uiDimensions';

const PRIMARY_MOUSE_BUTTON = 1;
const MINIMUM_DRAG_DISTANCE = 8;  // to leave some wiggle room for the mouse to move while clicking

const PlotView: React.FC = () => {
  const { state, dispatch } = useUiState();
  const { strWidth } = useContext(SettingsStateContext);

  const nothingSelected = state.selection === NoSelectionInPlot.getInstance();
  const selectedNodeIndicators = state.selection instanceof NodeSelectionInPlot
    ? state.selection.nodeIndicatorsAsArray : [];
  const { editedNodeIndicator } = state;

  const plot: PositionedPlot = useMemo(() => {
    const unpositionedPlot = state.contentState.current.plots[state.activePlotIndex];
    return applyNodePositionsToPlot(strWidth, unpositionedPlot);
  }, [state.contentState, state.activePlotIndex, strWidth]);

  const setSelection = (newSelection: SelectionInPlot) => dispatch(new SetSelection(newSelection));
  const moveNodes = (dx: number, dy: number) => dispatch(new MoveSelectedNodes(dx, dy));
  const moveTrees = (dx: number, dy: number) => dispatch(new MoveSelectedTrees(dx, dy));
  const adoptNodes = (adoptedNodeIndicators: NodeIndicatorInPlot[]) =>
    dispatch(new AdoptNodesBySelection(adoptedNodeIndicators));
  const disownNodes = (disownedNodeIndicators: NodeIndicatorInPlot[]) =>
    dispatch(new DisownNodesBySelection(disownedNodeIndicators));

  const [dragStartCoords, setDragStartCoords] = useState<CoordsInClient | undefined>();
  const [dragEndCoords, setDragEndCoords] = useState<CoordsInClient | undefined>();
  const [mouseInteractionMode, setMouseInteractionMode] =
    useState<'idle' | 'selecting' | 'panning' | 'draggingNodes' | 'draggingTrees'>('idle');

  const selectionBoxTopLeft: CoordsInClient | undefined = mouseInteractionMode === 'selecting' && dragStartCoords && dragEndCoords ? new CoordsInClient(
    Math.min(dragStartCoords.clientX, dragEndCoords.clientX),
    Math.min(dragStartCoords.clientY, dragEndCoords.clientY),
  ) : undefined;

  const selectionBoxBottomRight: CoordsInClient | undefined = mouseInteractionMode === 'selecting' && dragStartCoords && dragEndCoords ? new CoordsInClient(
    Math.max(dragStartCoords.clientX, dragEndCoords.clientX),
    Math.max(dragStartCoords.clientY, dragEndCoords.clientY),
  ) : undefined;

  const dragOffset: ClientCoordsOffset | undefined = dragStartCoords && dragEndCoords ? new ClientCoordsOffset(
    dragEndCoords.clientX - dragStartCoords.clientX,
    dragEndCoords.clientY - dragStartCoords.clientY,
  ) : undefined;

  const addTreeAndFocus = (position: CoordsInPlot) => {
    const newTreeId = generateTreeId();
    dispatch(new AddTree(newTreeId, position));
    setTimeout(() =>
      (document.querySelector(`input#${newTreeId}`) as (HTMLInputElement | null))?.focus(), 50);
  };

  const handleNodesSelect = (nodeIndicators: NodeIndicatorInPlot[], mode: EntitySelectionMode = EntitySelectionMode.SetSelection) =>
    state.selectionAction === EntitySelectionAction.Adopt ? adoptNodes(nodeIndicators)
      : state.selectionAction === EntitySelectionAction.Disown ? disownNodes(nodeIndicators)
      : setSelection(applyNodeSelection(mode, nodeIndicators, selectedNodeIndicators));

  const handlePlotClick = (event: React.MouseEvent<SVGElement>) => {
    if (nothingSelected) {
      addTreeAndFocus(new CoordsInClient(event.clientX - SVG_X, event.clientY - SVG_Y).toCoordsInPlot(state.panZoomState));
    } else {
      setSelection(NoSelectionInPlot.getInstance());
    }
  };

  const handlePlotMouseDown = (event: React.MouseEvent<SVGElement>) => {
    if (event.currentTarget === event.target && !event.shiftKey) {  // Only start a selection box from an empty area
      setMouseInteractionMode('selecting');
      setDragStartCoords(new CoordsInClient(event.clientX - SVG_X, event.clientY - SVG_Y));
    } else if (event.shiftKey) {
      setMouseInteractionMode('panning');
    }
  };

  const handlePlotMouseMove = (event: React.MouseEvent<SVGElement>) => {
    if (event.buttons === PRIMARY_MOUSE_BUTTON && !event.shiftKey && dragStartCoords) {
      const xDistToDragStart = Math.abs(dragStartCoords?.clientX - event.clientX);
      const yDistToDragStart = Math.abs(dragStartCoords?.clientY - event.clientY);
      if (dragEndCoords || xDistToDragStart > MINIMUM_DRAG_DISTANCE || yDistToDragStart > MINIMUM_DRAG_DISTANCE) {
        setDragEndCoords(new CoordsInClient(event.clientX - SVG_X, event.clientY - SVG_Y));
      }
    } else if (event.buttons === PRIMARY_MOUSE_BUTTON && mouseInteractionMode === 'panning') {
      dispatch(new Pan(new ClientCoordsOffset(event.movementX, event.movementY)));
    }
  };

  const handlePlotMouseUp = (event: React.MouseEvent<SVGElement>) => {
    if (selectionBoxTopLeft && selectionBoxBottomRight) {
      const rectInPlot = new RectInClient(selectionBoxTopLeft, selectionBoxBottomRight)
        .toRectInPlot(state.panZoomState);
      const newSelectedNodes = plot.filterNodeIndicatorsAsArray((tree, node) => isNodeInRect(tree, node, rectInPlot));
      handleNodesSelect(newSelectedNodes, event.ctrlKey || event.metaKey ? EntitySelectionMode.AddToSelection : EntitySelectionMode.SetSelection);
    } else if (dragOffset && mouseInteractionMode === 'draggingNodes') {
      moveNodes(dragOffset.dClientX, dragOffset.dClientY);
    } else if (dragOffset && mouseInteractionMode === 'draggingTrees') {
      moveTrees(dragOffset.dClientX, dragOffset.dClientY);
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
      setDragStartCoords(new CoordsInClient(event.clientX - SVG_X, event.clientY - SVG_Y));
    }
  };

  const handleTreeMouseDown = (event: React.MouseEvent<SVGElement>) => {
    if (event.buttons === PRIMARY_MOUSE_BUTTON) {
      setMouseInteractionMode('draggingTrees');
      setDragStartCoords(new CoordsInClient(event.clientX - SVG_X, event.clientY - SVG_Y));
    }
  };

  const handlePlotWheel = (event: React.WheelEvent<SVGElement>) => {
    if (event.ctrlKey || event.metaKey) {
      const relativeZoomFactor = 1 - event.deltaY / 100;
      dispatch(new Zoom(relativeZoomFactor, new CoordsInClient(event.clientX, event.clientY)));
    } else if (event.shiftKey) {  // Horizontal pan, for devices with a vertical-only scroll wheel (most mice)
      dispatch(new Pan(new ClientCoordsOffset(-event.deltaY, 0)));
    } else {
      dispatch(new Pan(new ClientCoordsOffset(-event.deltaX, -event.deltaY)));
    }
  };

  const preventDefaultDragEvent = (event: React.DragEvent<SVGElement>) => event.preventDefault();

  const handleDrop = (event: React.DragEvent<SVGElement>) => {
    event.preventDefault();
    const text = event.dataTransfer.getData('text/plain');
    if (text.startsWith('[') && text.endsWith(']')) {
      event.preventDefault();
      dispatch(new AddTreeFromLbn(new CoordsInClient(event.clientX, event.clientY), text));
    }
  };

  const plotViewCursor =
    (mouseInteractionMode === 'draggingNodes' || mouseInteractionMode === 'draggingTrees') && dragOffset ? 'move'
      : (mouseInteractionMode === 'panning') ? 'grabbing'
        : 'crosshair';

  return <>
    <svg
      className="PlotView--svg"
      width="100%"
      height="100%"
      style={{ cursor: plotViewCursor }}
      onMouseDown={handlePlotMouseDown}
      onMouseMove={handlePlotMouseMove}
      onMouseUp={handlePlotMouseUp}
      onWheel={handlePlotWheel}
      onDragEnter={preventDefaultDragEvent}
      onDragOver={preventDefaultDragEvent}
      onDrop={handleDrop}
    >
      {plot.trees.map(tree =>
        <TreeView
          key={`tree-${tree.id}`}
          treeId={tree.id}
          tree={tree}
          nodeDragOffset={mouseInteractionMode === 'draggingNodes' ? dragOffset : undefined}
          treeDragOffset={mouseInteractionMode === 'draggingTrees' ? dragOffset : undefined}
          onNodeMouseDown={handleNodeMouseDown}
          onTreeMouseDown={handleTreeMouseDown}
        />)}
      {selectionBoxTopLeft && selectionBoxBottomRight && <rect
        className="PlotView--selection-box"
        x={selectionBoxTopLeft.clientX}
        y={selectionBoxTopLeft.clientY}
        width={selectionBoxBottomRight.clientX - selectionBoxTopLeft.clientX}
        height={selectionBoxBottomRight.clientY - selectionBoxTopLeft.clientY}
      />}
    </svg>
    {plot.trees.map(tree =>
      <SentenceView
        key={`sentence-${tree.id}`}
        tree={tree}
        treeId={tree.id}
        className={selectionBoxTopLeft && selectionBoxBottomRight ? 'box-selecting' : undefined}
      />)}
    {editedNodeIndicator && <LabelNodeEditor
      key={`editable-nodes-${editedNodeIndicator.nodeId}`}
      tree={plot.tree(editedNodeIndicator.treeId)}
      nodeId={editedNodeIndicator.nodeId}
    />}
    <ZoomControl />
  </>;
};

export default PlotView;
