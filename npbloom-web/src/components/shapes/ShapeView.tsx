import React from 'react';
import {
  ClientCoordsOffset,
  EnclosureShape,
  EntitySelectionMode,
  LineShape,
  PlotShape,
  PanZoomState,
} from 'npbloom-core';
import { Id } from '../../types';
import { renderEnclosure } from './enclosures';
import { renderLine } from './lines';
import './ShapeView.scss';

interface ShapeViewProps {
  shape: PlotShape;
  isSelected: boolean;
  panZoomState: PanZoomState;
  dragOffset?: ClientCoordsOffset;
  resizePreviewShape?: PlotShape;
  onMouseDown: (event: React.MouseEvent<SVGElement>) => void;
  onSelect: (id: Id, mode: EntitySelectionMode) => void;
  onResizeHandleMouseDown: (handleId: string, event: React.MouseEvent<SVGElement>) => void;
}

const ShapeView: React.FC<ShapeViewProps> = ({
  shape,
  isSelected,
  panZoomState,
  dragOffset,
  resizePreviewShape,
  onMouseDown,
  onSelect,
  onResizeHandleMouseDown,
}) => {
  // Mouse interaction is the same for all shapes - clicking selects the shape, dragging moves it.
  // Resizing is handled separately since it is different between shape types.
  const handleShapeMouseDown = (event: React.MouseEvent<SVGElement>) => {
    event.stopPropagation();
    onSelect(
      shape.id,
      event.ctrlKey || event.metaKey
        ? EntitySelectionMode.AddToSelection
        : EntitySelectionMode.SetSelection
    );
    onMouseDown(event);
  };

  if (shape instanceof EnclosureShape) return renderEnclosure(
    shape,
    isSelected,
    panZoomState,
    dragOffset,
    resizePreviewShape as EnclosureShape | undefined,
    handleShapeMouseDown,
    onResizeHandleMouseDown,
  );

  if (shape instanceof LineShape) return renderLine(
    shape,
    isSelected,
    panZoomState,
    dragOffset,
    resizePreviewShape as LineShape | undefined,
    handleShapeMouseDown,
    onResizeHandleMouseDown,
  );

  return null;
};

export default ShapeView;
