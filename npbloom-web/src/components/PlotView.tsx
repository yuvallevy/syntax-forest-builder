import { useMemo, useState } from 'react';
import {
  AddTree, AdoptNodesBySelection, applyNodePositionsToPlot, applySelection, ClientCoordsOffset, CoordsInClient,
  DisownNodesBySelection, generateTreeId, isNodeInRect, MoveSelectedNodes, NodeIndicatorInPlot, NodeSelectionAction,
  NodeSelectionInPlot, NodeSelectionMode, PlotCoordsOffset, PositionedNode, PositionedPlot, PositionedTree,
  RectInClient, SelectionInPlot, SetSelection
} from 'npbloom-core';
import TreeView from './TreeView';
import SentenceView from './SentenceView';
import LabelNodeEditor from './LabelNodeEditor';
import './PlotView.scss';
import strWidth from '../strWidth/strWidthByChars';
import useUiState from '../useUiState';

const PRIMARY_MOUSE_BUTTON = 1;
const MINIMUM_DRAG_DISTANCE = 8;  // to leave some wiggle room for the mouse to move while clicking

const PlotView: React.FC = () => {
  const { state, dispatch } = useUiState();

  const nothingSelected = state.selection instanceof NodeSelectionInPlot &&
    state.selection.nodeIndicatorsAsArray.length === 0;
  const selectedNodeIndicators = state.selection instanceof NodeSelectionInPlot
    ? state.selection.nodeIndicatorsAsArray : [];
  const { editedNodeIndicator } = state;

  const plot: PositionedPlot = useMemo(() => {
    const unpositionedPlot = state.contentState.current.plots[state.activePlotIndex];
    return applyNodePositionsToPlot(strWidth, unpositionedPlot);
  }, [state.contentState, state.activePlotIndex]);

  const setSelection = (newSelection: SelectionInPlot) => dispatch(new SetSelection(newSelection));
  const moveNodes = (dx: number, dy: number) => dispatch(new MoveSelectedNodes(dx, dy));
  const adoptNodes = (adoptedNodeIndicators: NodeIndicatorInPlot[]) =>
    dispatch(new AdoptNodesBySelection(adoptedNodeIndicators));
  const disownNodes = (disownedNodeIndicators: NodeIndicatorInPlot[]) =>
    dispatch(new DisownNodesBySelection(disownedNodeIndicators));

  const [dragStartCoords, setDragStartCoords] = useState<CoordsInClient | undefined>();
  const [dragEndCoords, setDragEndCoords] = useState<CoordsInClient | undefined>();
  const [mouseInteractionMode, setMouseInteractionMode] = useState<'idle' | 'selecting' | 'draggingNodes'>('idle');

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

  const addTreeAndFocus = (position: PlotCoordsOffset) => {
    const newTreeId = generateTreeId();
    dispatch(new AddTree(newTreeId, position));
    setTimeout(() =>
      (document.querySelector(`input#${newTreeId}`) as (HTMLInputElement | null))?.focus(), 50);
  };

  const handleNodesSelect = (nodeIndicators: NodeIndicatorInPlot[], mode: NodeSelectionMode = NodeSelectionMode.SetSelection) =>
    state.selectionAction === NodeSelectionAction.Adopt ? adoptNodes(nodeIndicators)
      : state.selectionAction === NodeSelectionAction.Disown ? disownNodes(nodeIndicators)
      : setSelection(NodeSelectionInPlot.Companion.fromArray(
        applySelection(mode, nodeIndicators, selectedNodeIndicators)));

  const handlePlotClick = (event: React.MouseEvent<SVGElement>) => {
    if (nothingSelected) {
      addTreeAndFocus(new PlotCoordsOffset(event.clientX, event.clientY));
    } else {
      setSelection(NodeSelectionInPlot.Companion.fromArray([]));
    }
  };

  const handlePlotMouseDown = (event: React.MouseEvent<SVGElement>) => {
    if (event.currentTarget === event.target) {  // Only start a selection box from an empty area
      setMouseInteractionMode('selecting');
      setDragStartCoords(new CoordsInClient(event.clientX, event.clientY));
    }
  };

  const handlePlotMouseMove = (event: React.MouseEvent<SVGElement>) => {
    if (event.buttons === PRIMARY_MOUSE_BUTTON && dragStartCoords) {
      const xDistToDragStart = Math.abs(dragStartCoords?.clientX - event.clientX);
      const yDistToDragStart = Math.abs(dragStartCoords?.clientY - event.clientY);
      if (dragEndCoords || xDistToDragStart > MINIMUM_DRAG_DISTANCE || yDistToDragStart > MINIMUM_DRAG_DISTANCE) {
        setDragEndCoords(new CoordsInClient(event.clientX, event.clientY));
      }
    }
  };

  const handlePlotMouseUp = (event: React.MouseEvent<SVGElement>) => {
    if (selectionBoxTopLeft && selectionBoxBottomRight) {
      const rectInPlot = new RectInClient(selectionBoxTopLeft, selectionBoxBottomRight).toRectInPlot();
      const nodeInRectPredicate = (tree: PositionedTree, node: PositionedNode) => isNodeInRect(tree, node, rectInPlot);
      const newSelectedNodes = plot.filterNodeIndicatorsAsArray(nodeInRectPredicate);
      handleNodesSelect(newSelectedNodes, event.ctrlKey || event.metaKey ? NodeSelectionMode.AddToSelection : NodeSelectionMode.SetSelection);
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
      setDragStartCoords(new CoordsInClient(event.clientX, event.clientY));
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
      {plot.trees.map(tree =>
        <TreeView
          key={`tree-${tree.id}`}
          treeId={tree.id}
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
  </>;
};

export default PlotView;