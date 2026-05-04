/**
 * Watch out - this is a big one!
 * If you're reading this for the first time, start with the entry point, `usePlotMouseInteractions`.
 * 
 * This file contains the mouse interaction logic for the plot, consisting of:
 * - a mouse interaction state machine that tracks what the user is currently doing with the mouse
 * - handlers for mouse events on the plot and its entities that update the mouse interaction state
 *   and dispatch actions to edit the UI state and content as needed
 * 
 * The logic for moving and resizing existing entities seems misplaced in this file,
 * since the name implies it is strictly about plot-level interactions.
 * The reason is that mouse movements and drags can register on the plot even when they start on an entity,
 * since the user might move the mouse very quickly and end up outside the entity before the `onMouseMove` event fires.
 * If the handlers for these interactions were registered on the entity-level handlers, the user would have to
 * move the mouse very slowly and carefully so that the cursor never leaves the entity while dragging.
 * From a UX perspective, this is unacceptable - natural mouse drags are going to be faster than that.
 * Event handlers where this is not a risk, such as selecting a single node by clicking on it,
 * are registered on the entity-level handlers as expected.
 */

import { useEffect, useState } from 'react';
import {
  AddShapeToPlot, AddTree, AddTreeFromLbn, AdoptNodesBySelection, applyNodeSelection, applyTreeSelection, Arrowhead,
  ClientCoordsOffset, CoordsInClient, CoordsInPlot, DisownNodesBySelection, EnclosureShape, EntitySelectionAction,
  EntitySelectionMode, generateShapeId, generateTreeId, isNodeInRect, LineShape, MoveSelectedNodes, MoveSelectedShapes,
  MoveSelectedTrees, NodeIndicatorInPlot, NodeSelectionInPlot, NoSelectionInPlot, Pan, PanZoomState, PlotShape,
  PositionedPlot, PositionedTree, RectInClient, RectInPlot, SelectionInPlot, SetSelection, ShapeSelectionInPlot,
  ShapeTool, TransformSelectedShape, TreeSelectionInPlot, UiAction, UiState, Zoom
} from 'npbloom-core';
import { NODE_AREA_HEIGHT, SENTENCE_AREA_HEIGHT, SVG_X, SVG_Y } from '../uiDimensions';

const PRIMARY_MOUSE_BUTTON = 1;
const MINIMUM_SELECTION_BOX_DIMENSION = 8;  // to leave some wiggle room for the mouse to move while clicking

type MouseInteractionMode =
  | 'idle'
  | 'selecting'
  | 'panning'
  | 'draggingNodes'
  | 'draggingTrees'
  | 'draggingShapes'
  | 'resizingShape'
  | 'creatingShape'
;

/**
 * Returns whether the given tree's bounding box is fully enclosed within the given rectangle in plot coordinates.
 * Used to determine whether a selection box should select trees or nodes.
 */
const isTreeInRect = (tree: PositionedTree, rect: RectInPlot) =>
  // tree.position.plotX and tree.position.plotY are at the top left of the sentence area.
  // The tree's bounding box extends to the right by tree.width, upwards by tree.height + NODE_AREA_HEIGHT, and downwards by SENTENCE_AREA_HEIGHT.
  tree.position.plotX >= rect.topLeft.plotX &&
  tree.position.plotX + tree.width <= rect.bottomRight.plotX &&
  tree.position.plotY - (tree.height + NODE_AREA_HEIGHT) >= rect.topLeft.plotY &&
  tree.position.plotY + SENTENCE_AREA_HEIGHT <= rect.bottomRight.plotY;

/**
 * Determines the correct action to take when a new node selection is made, based on
 * - the current selection mode (replace or add to selection)
 * - the current selection action (set selection, adopt into selection, or disown from selection)
 * and returns the corresponding UiAction to dispatch.
 */
const nodeSelectionAction = (
  newNodeIndicators: NodeIndicatorInPlot[],
  alreadySelectedNodeIndicators: NodeIndicatorInPlot[],
  selectionMode: EntitySelectionMode = EntitySelectionMode.SetSelection,
  selectionAction: EntitySelectionAction,
): UiAction =>
  selectionAction === EntitySelectionAction.Adopt ? new AdoptNodesBySelection(newNodeIndicators)
    : selectionAction === EntitySelectionAction.Disown ? new DisownNodesBySelection(newNodeIndicators)
      : new SetSelection(applyNodeSelection(selectionMode, newNodeIndicators, alreadySelectedNodeIndicators));

/**
 * Determines the correct action to take when a new selection box is made.
 * If any trees are fully enclosed in the selection box, these trees will be selected;
 * otherwise, any nodes that are enclosed in the selection box will be selected
 * (which may include nodes from partially enclosed trees, and may include nodes across multiple trees).
 * In the case of nodes, the exact action is deferred to the nodeSelectionAction function,
 * which takes into account the current selection action (set, adopt, or disown) and mode (replace or add).
 * Returns the corresponding UiAction to dispatch.
 */
const actionOnSelectBoxCompletion = (
  plot: PositionedPlot,
  rectInPlot: RectInPlot,
  currentSelection: SelectionInPlot,
  selectionMode: EntitySelectionMode,
  selectionAction: EntitySelectionAction,
): UiAction => {
  // Figure out if we're trying to select nodes or trees
  const enclosedTreeIds = plot.treesAsArray.filter(tree => isTreeInRect(tree, rectInPlot)).map(tree => tree.id);

  if (enclosedTreeIds.length > 0) {
    const alreadySelectedTreeIds = currentSelection instanceof TreeSelectionInPlot ? currentSelection.treeIdsAsArray : [];
    return new SetSelection(applyTreeSelection(selectionMode, enclosedTreeIds, alreadySelectedTreeIds));
  } else {
    const alreadySelectedNodeIndicators = currentSelection instanceof NodeSelectionInPlot ? currentSelection.nodeIndicatorsAsArray : [];
    const newSelectedNodes = plot.filterNodeIndicatorsAsArray((tree, node) => isNodeInRect(tree, node, rectInPlot));
    return nodeSelectionAction(newSelectedNodes, alreadySelectedNodeIndicators, selectionMode, selectionAction);
  }
};

/**
 * Given a delta x and y, returns a new delta x and y that is snapped to the nearest 45-degree angle.
 */
const snapAngleTo45Deg = (dx: number, dy: number): [number, number] => {
  const snapped = Math.round(Math.atan2(dy, dx) / (Math.PI / 4)) * (Math.PI / 4);
  const length = Math.hypot(dx, dy);
  return [Math.cos(snapped) * length, Math.sin(snapped) * length];
};

/**
 * Given the original shape, the resize handle being dragged, and the distance dragged in plot coordinates,
 * computes the new shape that would result from resizing the original shape according to that drag.
 * Used both to show shape previews while resizing and to determine the final shape when completing a resize drag.
 */
const computeResizedShape = (
  original: PlotShape,
  handleId: string,
  dPlotX: number,
  dPlotY: number,
  snapAngles: boolean, // Cannot rely on the effective dragOffset here, since the reference frame is not the same
): PlotShape => {
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
      let newX = original.start.plotX + dPlotX;
      let newY = original.start.plotY + dPlotY;
      if (snapAngles) {
        const [dx, dy] = snapAngleTo45Deg(newX - original.end.plotX, newY - original.end.plotY);
        newX = original.end.plotX + dx;
        newY = original.end.plotY + dy;
      }
      return original.copy(undefined, new CoordsInPlot(newX, newY));
    }
    if (handleId === 'end') {
      let newX = original.end.plotX + dPlotX;
      let newY = original.end.plotY + dPlotY;
      if (snapAngles) {
        const [dx, dy] = snapAngleTo45Deg(newX - original.start.plotX, newY - original.start.plotY);
        newX = original.start.plotX + dx;
        newY = original.start.plotY + dy;
      }
      return original.copy(undefined, undefined, new CoordsInPlot(newX, newY));
    }
  }
  return original;
};

/**
 * Given the shape tool being used and the start and end coordinates of a drag in plot coordinates,
 * returns the corresponding shape to be added to the plot.
 * Used both to show shape previews while creating and to determine the final shape when completing a creation drag.
 */
const createShapeFromDrag = (tool: ShapeTool, startCoords: CoordsInPlot, endCoords: CoordsInPlot) => {
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

/**
 * Determines the correct editing action to take when a drag is completed.
 * Returns the corresponding UiAction to dispatch.
 * This can be moving nodes, trees, or shapes; resizing a shape; or creating a shape.
 */
const actionOnDragCompletion = (
  mouseInteractionMode: MouseInteractionMode,
  dragStartCoords: CoordsInClient,
  dragEndCoords: CoordsInClient,
  panZoomState: PanZoomState,
  activeShapeTool: ShapeTool,
  resizingShape: PlotShape | undefined,
  resizeHandleId: string | undefined,
  isShiftDragging: boolean,
): UiAction | undefined => {
  // Find how much the mouse has moved in plot coordinates (taking zoom level into account) since the start of the drag
  const dPlotX = (dragEndCoords.clientX - dragStartCoords.clientX) / panZoomState.zoomLevel;
  const dPlotY = (dragEndCoords.clientY - dragStartCoords.clientY) / panZoomState.zoomLevel;

  // If we're moving any entity, return the corresponding Move action for that entity type
  if (mouseInteractionMode === 'draggingNodes') return new MoveSelectedNodes(dPlotX, dPlotY);
  if (mouseInteractionMode === 'draggingTrees') return new MoveSelectedTrees(dPlotX, dPlotY);
  if (mouseInteractionMode === 'draggingShapes') return new MoveSelectedShapes(dPlotX, dPlotY);

  // If we're resizing a shape, return a TransformSelectedShape action with the new shape resulting from that resize
  if (mouseInteractionMode === 'resizingShape' && resizingShape && resizeHandleId) {
    const newShape = computeResizedShape(resizingShape, resizeHandleId, dPlotX, dPlotY, isShiftDragging);
    return new TransformSelectedShape(newShape);
  }

  // If we're creating a shape, return an AddShapeToPlot action with the shape corresponding to the drag we just made
  if (mouseInteractionMode === 'creatingShape') {
    const startCoordsInPlot = dragStartCoords.toCoordsInPlot(panZoomState);
    const endCoordsInPlot = dragEndCoords.toCoordsInPlot(panZoomState);
    const shape = createShapeFromDrag(activeShapeTool, startCoordsInPlot, endCoordsInPlot);
    return new AddShapeToPlot(shape);
  }
};

const usePlotMouseInteractions = (
  state: UiState,
  dispatch: React.Dispatch<UiAction>,
  plot: PositionedPlot,
  svgRef: React.RefObject<SVGSVGElement>,
) => {
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

  const [dragStartCoords, setDragStartCoords] = useState<CoordsInClient | undefined>();
  const [rawDragEndCoords, setRawDragEndCoords] = useState<CoordsInClient | undefined>();
  const [mouseInteractionMode, setMouseInteractionMode] =
    useState<MouseInteractionMode>('idle');
  const [resizeHandleId, setResizeHandleId] = useState<string | undefined>();
  const [resizingShape, setResizingShape] = useState<PlotShape | undefined>();
  const [isShiftDragging, setIsShiftDragging] = useState(false);

  // `dragEndCoords` is split into "raw" and "effective" versions.
  // The "raw" version is derived directly from the distance the mouse has traveled since the start of the drag,
  // without any adjustments.
  // The "effective" version is the one that is used in practice, and may be adjusted from the raw version
  // when the Shift key is held down and at least one of the following interaction modes is in effect:
  // - Creating a LineShape (i.e. line or arrow)
  // - Moving nodes, trees, or shapes
  //
  // Note: the effective drag offset cannot be used for snapping when resizing lines.
  // This is because the reference frame for moving is the drag start coordinates (what `dragOffset` assumes),
  // while the reference frame for resizing is the opposite endpoint of the line (which is not at the drag start coordinates).
  // See `computeResizedShape` for how snapping is handled when resizing line shapes.

  // Whether we are currently in a mode where we want to snap to 45-degree angles when the user is holding Shift.
  const canSnapTo45Deg = mouseInteractionMode === 'draggingNodes' ||
    mouseInteractionMode === 'draggingTrees' ||
    mouseInteractionMode === 'draggingShapes' ||
    (mouseInteractionMode === 'creatingShape' && (
      state.activeShapeTool === ShapeTool.Line || state.activeShapeTool === ShapeTool.Arrow
    ));

  const dragEndCoords = (() => {
    if (!rawDragEndCoords) return undefined;
    if (isShiftDragging && canSnapTo45Deg && dragStartCoords) {
      const [snappedX, snappedY] = snapAngleTo45Deg(
        rawDragEndCoords.clientX - dragStartCoords.clientX,
        rawDragEndCoords.clientY - dragStartCoords.clientY,
      );
      return new CoordsInClient(dragStartCoords.clientX + snappedX, dragStartCoords.clientY + snappedY);
    }
    return rawDragEndCoords;
  })();

  const dragOffset: ClientCoordsOffset | undefined = dragStartCoords && dragEndCoords ? new ClientCoordsOffset(
    dragEndCoords.clientX - dragStartCoords.clientX,
    dragEndCoords.clientY - dragStartCoords.clientY,
  ) : undefined;

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

  const plotViewCursor =
    (mouseInteractionMode === 'draggingNodes' || mouseInteractionMode === 'draggingTrees' || mouseInteractionMode === 'draggingShapes') && dragOffset ? 'move'
      : mouseInteractionMode === 'resizingShape' ? 'grabbing'
        : (mouseInteractionMode === 'panning') ? 'grabbing'
          : 'crosshair';

  const resizePreviewShape = mouseInteractionMode === 'resizingShape' && resizingShape && resizeHandleId && dragOffset
    ? computeResizedShape(resizingShape, resizeHandleId,
        dragOffset.dClientX / state.panZoomState.zoomLevel,
        dragOffset.dClientY / state.panZoomState.zoomLevel,
        isShiftDragging,
      )
    : undefined;

  const creationPreviewShape = mouseInteractionMode === 'creatingShape' && dragStartCoords && dragEndCoords
    ? createShapeFromDrag(
      state.activeShapeTool,
      dragStartCoords.toCoordsInPlot(state.panZoomState),
      dragEndCoords.toCoordsInPlot(state.panZoomState),
    ) : undefined;

  const addTreeAndFocus = (position: CoordsInPlot) => {
    const newTreeId = generateTreeId();
    dispatch(new AddTree(newTreeId, position));
    setTimeout(() =>
      (document.querySelector(`input#${newTreeId}`) as (HTMLInputElement | null))?.focus(), 50);
  };

  const handlePlotClick = (event: React.MouseEvent<SVGElement>) => {
    if (state.selection === NoSelectionInPlot.getInstance()) {
      // If nothing is currently selected, create a new tree where the user clicked and focus it for editing right away
      addTreeAndFocus(new CoordsInClient(event.clientX - SVG_X, event.clientY - SVG_Y).toCoordsInPlot(state.panZoomState));
    } else {
      // If something is currently selected, clear the selection to get ready for a new selection or action
      dispatch(new SetSelection(NoSelectionInPlot.getInstance()));
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
    // Don't do anything if the mouse isn't dragging with the primary button pressed
    if (event.buttons !== PRIMARY_MOUSE_BUTTON) return;
  
    // If we're panning, dispatch a Pan action for the distance the mouse has moved since the last event,
    // and return early since we don't need to update any drag coordinates in state for a pan
    if (mouseInteractionMode === 'panning') {
      dispatch(new Pan(new ClientCoordsOffset(event.movementX, event.movementY)));
      return;
    }

    // If for some reason the drag start coordinates aren't set, we probably aren't in a valid drag state,
    // so don't do anything
    if (!dragStartCoords) return;

    // If we have valid drag start coordinates, update the drag end coordinates in state to the current mouse position
    setRawDragEndCoords(new CoordsInClient(event.clientX - SVG_X, event.clientY - SVG_Y));
    setIsShiftDragging(event.shiftKey);
  };

  const handlePlotMouseUp = (event: React.MouseEvent<SVGElement>) => {
    // Determine what action we're completing, between:
    // - Making a box selection (if we dragged out a selection box from an empty area)
    // - Moving nodes, trees, or shapes (if we dragged from a selected entity)
    // - Resizing a shape (if we dragged from a shape's resize handle)
    // - Creating a shape (if we dragged from an empty area while a shape tool was active)
    // - Clicking to clear selection or create a new tree (if we just clicked without dragging)

    // To count as a box selection, we must have a selection box (which only starts if we drag from an empty area)
    // and we must have dragged at least a minimum distance, to distinguish from small, accidental mouse movements while clicking.
    const isSelectionBoxIntentional = selectionBoxTopLeft && selectionBoxBottomRight && dragOffset && (
      Math.abs(dragOffset.dClientX) > MINIMUM_SELECTION_BOX_DIMENSION ||
        Math.abs(dragOffset.dClientY) > MINIMUM_SELECTION_BOX_DIMENSION
    );

    if (isSelectionBoxIntentional) {
      const rectInPlot = new RectInClient(selectionBoxTopLeft, selectionBoxBottomRight)
        .toRectInPlot(state.panZoomState);
      dispatch(actionOnSelectBoxCompletion(
        plot,
        rectInPlot,
        state.selection,
        event.ctrlKey || event.metaKey ? EntitySelectionMode.AddToSelection : EntitySelectionMode.SetSelection,
        state.selectionAction
      ));
    } else if (dragStartCoords && dragEndCoords && mouseInteractionMode !== 'selecting') {
      // In the context of editing the content, we will count any drag as intentional,
      // since even small drags can be meaningful (e.g. dragging a node a small distance to adjust the tree layout).
      const action = actionOnDragCompletion(
        mouseInteractionMode,
        dragStartCoords,
        dragEndCoords,
        state.panZoomState,
        state.activeShapeTool,
        resizingShape,
        resizeHandleId,
        isShiftDragging,
      );
      if (action) dispatch(action);
    } else if (dragStartCoords && event.currentTarget === event.target) {
      handlePlotClick(event);
    }
    setDragStartCoords(undefined);
    setRawDragEndCoords(undefined);
    setResizeHandleId(undefined);
    setResizingShape(undefined);
    setIsShiftDragging(false);
    setMouseInteractionMode('idle');
  };

  // When the user clicks on an entity, we want to start a drag immediately so that they can move the entity by dragging without having to click twice.
  // Selection itself is not handled here; entity-level components will handle that in their own onMouseDown handlers,
  // and this handler will just take care of starting the drag after the entity is selected.
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

  // Prevent the default browser drag-and-drop behavior when dragging files or text into the plot,
  // since we want to use drag-and-drop for adding trees from text, and the default behavior would interfere with that.
  const preventDefaultDragEvent = (event: React.DragEvent<SVGElement>) => event.preventDefault();

  // Handle dropping text into the plot to create a new tree from that text in labelled bracket notation.
  const handleDrop = (event: React.DragEvent<SVGElement>) => {
    event.preventDefault();
    const text = event.dataTransfer.getData('text/plain');
    if (text.startsWith('[') && text.endsWith(']')) {
      event.preventDefault();
      dispatch(new AddTreeFromLbn(new CoordsInClient(event.clientX, event.clientY), text));
    }
  };

  return {
    mouseInteractionMode,
    selectedShapeIds,
    selectionBoxTopLeft,
    selectionBoxBottomRight,
    dragOffset,
    plotViewCursor,
    resizePreviewShape,
    creationPreviewShape,
    handlePlotMouseDown,
    handlePlotMouseMove,
    handlePlotMouseUp,
    handleNodeMouseDown,
    handleTreeMouseDown,
    handleShapeMouseDown,
    handleResizeHandleMouseDown,
    handlePlotWheel,
    preventDefaultDragEvent,
    handleDrop,
  };
};

export default usePlotMouseInteractions;
