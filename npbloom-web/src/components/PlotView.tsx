import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  AddTree, AddTreeFromLbn, AddShapeToPlot, AdoptNodesBySelection, applyNodePositionsToPlot, applyNodeSelection,
  applyShapeSelection, applyTreeSelection, Arrowhead, ClientCoordsOffset, CoordsInPlot, CoordsInClient,
  DisownNodesBySelection, EnclosureShape, EntitySelectionAction, EntitySelectionMode, generateShapeId,
  generateTreeId, isNodeInRect, LineShape, MoveSelectedNodes, MoveSelectedShapes, MoveSelectedTrees,
  NodeIndicatorInPlot, NodeSelectionInPlot, NoSelectionInPlot, Pan, PlotShape, PositionedPlot, RectInClient,
  RectInPlot, SelectionInPlot, SetSelection, ShapeSelectionInPlot, ShapeTool, TransformSelectedShape,
  TreeSelectionInPlot, Zoom
} from 'npbloom-core';
import TreeView from './TreeView';
import ShapeView from './shapes/ShapeView.tsx';
import SentenceView from './SentenceView';
import LabelNodeEditor from './LabelNodeEditor';
import ZoomControl from "./ZoomControl.tsx";
import './PlotView.scss';
import useUiState from '../useUiState';
import SettingsStateContext from '../SettingsStateContext';
import { NODE_AREA_HEIGHT, SENTENCE_AREA_HEIGHT, SVG_X, SVG_Y } from '../uiDimensions';

const PRIMARY_MOUSE_BUTTON = 1;
const MINIMUM_DRAG_DISTANCE = 8;  // to leave some wiggle room for the mouse to move while clicking

const isTreeInRect = (tree: { position: { plotX: number; plotY: number }; width: number; height: number }, rect: RectInPlot) =>
  tree.position.plotX >= rect.topLeft.plotX &&
  tree.position.plotX + tree.width <= rect.bottomRight.plotX &&
  tree.position.plotY - tree.height - NODE_AREA_HEIGHT >= rect.topLeft.plotY &&
  tree.position.plotY + SENTENCE_AREA_HEIGHT <= rect.bottomRight.plotY;

const PlotView: React.FC = () => {
  const { state, dispatch } = useUiState();
  const { strWidth } = useContext(SettingsStateContext);

  const svgRef = useRef<SVGSVGElement>(null);

   /** Prevent pinch-zoom and ctrl+wheel zoom from also zooming the entire page,
    * since we're handling zooming within the plot ourselves. */
  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) e.preventDefault();
    };
    el.addEventListener('wheel', handler, { passive: false });
    return () => el.removeEventListener('wheel', handler);
  }, []);

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
  const moveShapes = (dx: number, dy: number) => dispatch(new MoveSelectedShapes(dx, dy));

  const [dragStartCoords, setDragStartCoords] = useState<CoordsInClient | undefined>();
  const [dragEndCoords, setDragEndCoords] = useState<CoordsInClient | undefined>();
  const [mouseInteractionMode, setMouseInteractionMode] =
    useState<'idle' | 'selecting' | 'panning' | 'draggingNodes' | 'draggingTrees' | 'draggingShapes' | 'resizingShape' | 'creatingShape'>('idle');
  const [resizeHandleId, setResizeHandleId] = useState<string | undefined>();
  const [resizingShape, setResizingShape] = useState<PlotShape | undefined>();

  const selectedShapeIds = state.selection instanceof ShapeSelectionInPlot
    ? state.selection.shapeIdsAsArray : [];
  const isCreatingShape = state.activeShapeTool !== ShapeTool.None;

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
    if (isCreatingShape && event.currentTarget === event.target && !event.shiftKey) {
      setMouseInteractionMode('creatingShape');
      setDragStartCoords(new CoordsInClient(event.clientX - SVG_X, event.clientY - SVG_Y));
    } else if (event.currentTarget === event.target && !event.shiftKey) {  // Only start a selection box from an empty area
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
    if (selectionBoxTopLeft && selectionBoxBottomRight &&
      // Dragging a tiny box is probably just intended to be a click, so don't count it as box selection
      dragOffset && (Math.abs(dragOffset.dClientX) > MINIMUM_DRAG_DISTANCE || Math.abs(dragOffset.dClientY) > MINIMUM_DRAG_DISTANCE)) {
      const rectInPlot = new RectInClient(selectionBoxTopLeft, selectionBoxBottomRight)
        .toRectInPlot(state.panZoomState);
      const mode = event.ctrlKey || event.metaKey ? EntitySelectionMode.AddToSelection : EntitySelectionMode.SetSelection;
      const enclosedTreeIds = plot.trees.map(tree => tree).filter(tree => isTreeInRect(tree, rectInPlot)).map(tree => tree.id);
      if (enclosedTreeIds.length > 0) {
        const existingTreeIds = state.selection instanceof TreeSelectionInPlot ? state.selection.treeIdsAsArray : [];
        setSelection(applyTreeSelection(mode, enclosedTreeIds, existingTreeIds));
      } else {
        const newSelectedNodes = plot.filterNodeIndicatorsAsArray((tree, node) => isNodeInRect(tree, node, rectInPlot));
        handleNodesSelect(newSelectedNodes, mode);
      }
    } else if (dragOffset && mouseInteractionMode === 'draggingNodes') {
      moveNodes(dragOffset.dClientX / state.panZoomState.zoomLevel, dragOffset.dClientY / state.panZoomState.zoomLevel);
    } else if (dragOffset && mouseInteractionMode === 'draggingTrees') {
      moveTrees(dragOffset.dClientX / state.panZoomState.zoomLevel, dragOffset.dClientY / state.panZoomState.zoomLevel);
    } else if (dragOffset && mouseInteractionMode === 'draggingShapes') {
      moveShapes(dragOffset.dClientX / state.panZoomState.zoomLevel, dragOffset.dClientY / state.panZoomState.zoomLevel);
    } else if (dragOffset && mouseInteractionMode === 'resizingShape' && resizingShape && resizeHandleId) {
      const dPlotX = dragOffset.dClientX / state.panZoomState.zoomLevel;
      const dPlotY = dragOffset.dClientY / state.panZoomState.zoomLevel;
      const newShape = computeResizedShape(resizingShape, resizeHandleId, dPlotX, dPlotY);
      dispatch(new TransformSelectedShape(newShape));
    } else if (dragOffset && mouseInteractionMode === 'creatingShape' && dragStartCoords && dragEndCoords
      && (Math.abs(dragOffset.dClientX) > MINIMUM_DRAG_DISTANCE || Math.abs(dragOffset.dClientY) > MINIMUM_DRAG_DISTANCE)) {
      const startPlot = dragStartCoords.toCoordsInPlot(state.panZoomState);
      const endPlot = dragEndCoords.toCoordsInPlot(state.panZoomState);
      const shape = createShapeFromDrag(startPlot, endPlot);
      dispatch(new AddShapeToPlot(shape));
    } else if (dragStartCoords && event.currentTarget === event.target) {
      handlePlotClick(event);
    }
    setDragStartCoords(undefined);
    setDragEndCoords(undefined);
    setResizeHandleId(undefined);
    setResizingShape(undefined);
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

  const handleShapeMouseDown = (event: React.MouseEvent<SVGElement>) => {
    if (event.buttons === PRIMARY_MOUSE_BUTTON) {
      setMouseInteractionMode('draggingShapes');
      setDragStartCoords(new CoordsInClient(event.clientX - SVG_X, event.clientY - SVG_Y));
    }
  };

  const handleShapeSelect = (shapeId: string, mode: EntitySelectionMode) => {
    const existing = state.selection instanceof ShapeSelectionInPlot
      ? [...state.selection.shapeIdsAsArray] : [];
    setSelection(applyShapeSelection(mode, [shapeId], existing));
  };

  const handleResizeHandleMouseDown = (handleId: string, event: React.MouseEvent<SVGElement>) => {
    if (event.buttons === PRIMARY_MOUSE_BUTTON && selectedShapeIds.length === 1) {
      const shape = plot.shapes.get(selectedShapeIds[0]);
      if (shape) {
        setMouseInteractionMode('resizingShape');
        setResizeHandleId(handleId);
        setResizingShape(shape);
        setDragStartCoords(new CoordsInClient(event.clientX - SVG_X, event.clientY - SVG_Y));
      }
    }
  };

  const computeResizedShape = (original: PlotShape, handleId: string, dPlotX: number, dPlotY: number): PlotShape => {
    if (original instanceof EnclosureShape) {
      let { x, y, width, height } = original;
      if (handleId.includes('w')) { x += dPlotX; width -= dPlotX; }
      if (handleId.includes('e')) { width += dPlotX; }
      if (handleId.includes('n')) { y += dPlotY; height -= dPlotY; }
      if (handleId.includes('s')) { height += dPlotY; }
      // Prevent negative dimensions by flipping
      if (width < 0) { x += width; width = -width; }
      if (height < 0) { y += height; height = -height; }
      return original.copy(undefined, x, y, width, height);
    }
    if (original instanceof LineShape) {
      if (handleId === 'start') {
        return original.copy(undefined, new CoordsInPlot(original.start.plotX + dPlotX, original.start.plotY + dPlotY));
      }
      if (handleId === 'end') {
        return original.copy(undefined, undefined, new CoordsInPlot(original.end.plotX + dPlotX, original.end.plotY + dPlotY));
      }
    }
    return original;
  };

  const createShapeFromDrag = (startCoords: CoordsInPlot, endCoords: CoordsInPlot) => {
    const tool = state.activeShapeTool;
    const id = generateShapeId();
    if (tool === ShapeTool.Line || tool === ShapeTool.Arrow) {
      return new LineShape(id, startCoords, endCoords,
        tool === ShapeTool.Arrow ? Arrowhead.End : Arrowhead.None);
    } else {
      const x = Math.min(startCoords.plotX, endCoords.plotX);
      const y = Math.min(startCoords.plotY, endCoords.plotY);
      const w = Math.abs(endCoords.plotX - startCoords.plotX);
      const h = Math.abs(endCoords.plotY - startCoords.plotY);
      const cornerRadius =
        tool === ShapeTool.Ellipse ? Infinity
          : tool === ShapeTool.RoundedRectangle ? 8
            : 0;
      return new EnclosureShape(id, x, y, w, h, cornerRadius);
    }
  };

  const handlePlotWheel = (event: React.WheelEvent<SVGElement>) => {
    if (event.ctrlKey || event.metaKey) {
      const relativeZoomFactor = 1 - event.deltaY / 100;
      dispatch(new Zoom(relativeZoomFactor, new CoordsInClient(event.clientX - SVG_X, event.clientY - SVG_Y)));
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

  const resizePreviewShape = mouseInteractionMode === 'resizingShape' && resizingShape && resizeHandleId && dragOffset
    ? computeResizedShape(resizingShape, resizeHandleId,
        dragOffset.dClientX / state.panZoomState.zoomLevel,
        dragOffset.dClientY / state.panZoomState.zoomLevel)
    : undefined;

  const creationPreviewShape = mouseInteractionMode === 'creatingShape' && dragStartCoords && dragEndCoords
    && (Math.abs(dragEndCoords.clientX - dragStartCoords.clientX) > MINIMUM_DRAG_DISTANCE
      || Math.abs(dragEndCoords.clientY - dragStartCoords.clientY) > MINIMUM_DRAG_DISTANCE)
    ? createShapeFromDrag(dragStartCoords.toCoordsInPlot(state.panZoomState), dragEndCoords.toCoordsInPlot(state.panZoomState))
    : undefined;

  const plotViewCursor =
    (mouseInteractionMode === 'draggingNodes' || mouseInteractionMode === 'draggingTrees' || mouseInteractionMode === 'draggingShapes') && dragOffset ? 'move'
      : mouseInteractionMode === 'resizingShape' ? 'grabbing'
        : (mouseInteractionMode === 'panning') ? 'grabbing'
          : 'crosshair';

  return <>
    <svg
      ref={svgRef}
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
      <defs>
        <pattern id="folded-pattern" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="6" stroke="#000" strokeWidth="1.5" />
        </pattern>
        <marker id="arrowhead-end" markerWidth="20" markerHeight="7" refX="10" refY="3.5" orient="auto">
          <polygon points="10 0, 20 3.5, 10 7" fill="#000" />
        </marker>
        <marker id="arrowhead-start" markerWidth="14" markerHeight="7" refX="0" refY="3.5" orient="auto">
          <polygon points="0 0, -10 3.5, 0 7" fill="#000" />
        </marker>
      </defs>
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
      {plot.shapes.map(shape =>
        <ShapeView
          key={`shape-${shape.id}`}
          shape={shape}
          isSelected={selectedShapeIds.includes(shape.id)}
          panZoomState={state.panZoomState}
          dragOffset={mouseInteractionMode === 'draggingShapes' ? dragOffset : undefined}
          resizePreviewShape={resizePreviewShape && shape.id === resizePreviewShape.id ? resizePreviewShape : undefined}
          onMouseDown={handleShapeMouseDown}
          onSelect={handleShapeSelect}
          onResizeHandleMouseDown={handleResizeHandleMouseDown}
        />)}
      {creationPreviewShape && <ShapeView
        key="creation-preview"
        shape={creationPreviewShape}
        isSelected={false}
        panZoomState={state.panZoomState}
      />}
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
