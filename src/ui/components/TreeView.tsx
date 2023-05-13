import React from 'react';
import { mapEntries } from '../../util/objTransforms';
import {
  Id, IdMap
} from '../../content/types';
import './TreeView.scss';
import { NodeSelectionMode } from '../selection';
import { NodeCreationTrigger, getNodeCreationTriggersForTree } from '../nodeCreationTriggers';
import { ClientCoordsOffset } from '../coords';
import strWidth from '../strWidth';
import {
  PositionedBranchingNode, PositionedNode, PositionedTerminalNode, PositionedTree
} from '../../content/positioned/types';

const NODE_LEVEL_SPACING = 20;
const TRIANGLE_BASE_Y = -2;

const NODE_AREA_WIDTH = 35;
const NODE_AREA_HEIGHT = 20;
const NODE_AREA_RELATIVE_X = -(NODE_AREA_WIDTH / 2);
const NODE_AREA_RELATIVE_Y = -18.5;

interface NodeCreationTriggerClickZoneProps {
  trigger: NodeCreationTrigger;
  onClick?: () => void;
}

interface TreeViewProps {
  treeId: Id;
  tree: PositionedTree;
  selectedNodeIds: Id[];
  nodeDragOffset?: ClientCoordsOffset;
  onNodeMouseDown?: (event: React.MouseEvent<SVGElement>) => void;
  onSingleNodeSelect?: (nodeId: Id, mode: NodeSelectionMode) => void;
  onNodeCreationTriggerClick?: (trigger: NodeCreationTrigger) => void;
}

const renderChildNodeConnections = (node: PositionedBranchingNode, allNodes: IdMap<PositionedNode>): React.ReactNode[] =>
  node.children.map(childId =>
    <line
      key={`to-${childId}`}
      stroke="#000"
      x1={node.position.treeX}
      y1={node.position.treeY}
      x2={allNodes[childId].position.treeX}
      y2={allNodes[childId].position.treeY - NODE_LEVEL_SPACING}
    />
  );

const renderTriangleConnection = (nodeId: Id, node: PositionedTerminalNode): React.ReactNode =>
  node.triangle && <path
    key={`triangle-${nodeId}`}
    stroke="#000"
    fill="none"
    d={`M${node.position.treeX} ${node.position.treeY} L${node.triangle.treeX1} ${TRIANGLE_BASE_Y}  L${node.triangle.treeX2} ${TRIANGLE_BASE_Y} Z`}
  />;

const renderNode = (
  nodeId: Id,
  node: PositionedNode,
  allNodes: IdMap<PositionedNode>,
  selectedNodeIds: Id[],
  nodeDragOffset?: ClientCoordsOffset,
  onMouseDown?: (event: React.MouseEvent<SVGElement>) => void,
  onSelect?: (id: Id, mode: NodeSelectionMode) => void,
): React.ReactNode[] => [
  <g
    key={nodeId}
    className={'TreeView-node' + (selectedNodeIds.includes(nodeId) ? ' TreeView-node-selected' : '')}
    onMouseDown={event => {
      onSelect && onSelect(nodeId, event.ctrlKey || event.metaKey ? 'ADD' : 'SET');
      onMouseDown && onMouseDown(event);
    }}
  >
    <rect
      x={node.position.treeX + NODE_AREA_RELATIVE_X}
      y={node.position.treeY + NODE_AREA_RELATIVE_Y}
      width={NODE_AREA_WIDTH}
      height={NODE_AREA_HEIGHT}
      rx={3}
      ry={3}
    />
    <text
      x={node.position.treeX}
      y={node.position.treeY}
      fill="#000"
      textAnchor="middle"
      dominantBaseline="text-after-edge"
    >
      {node.label}
    </text>
  </g>,
  nodeDragOffset && selectedNodeIds.includes(nodeId) && <rect
    key={`${nodeId}-ghost`}
    className="TreeView-node-ghost"
    x={node.position.treeX + NODE_AREA_RELATIVE_X + nodeDragOffset.dClientX}
    y={node.position.treeY + NODE_AREA_RELATIVE_Y + nodeDragOffset.dClientY}
    width={NODE_AREA_WIDTH}
    height={NODE_AREA_HEIGHT}
    rx={3}
    ry={3}
  />,
  'triangle' in node && renderTriangleConnection(nodeId, node),
  'children' in node && renderChildNodeConnections(node, allNodes),
];

const NodeCreationTriggerClickZone: React.FC<NodeCreationTriggerClickZoneProps> = ({ trigger, onClick }) =>
  <g
    className="NodeCreationTriggerClickZone"
    onClick={onClick}
  >
    <rect
      className="NodeCreationTriggerClickZone-area"
      x={trigger.topLeft.treeX}
      y={trigger.topLeft.treeY}
      width={trigger.bottomRight.treeX - trigger.topLeft.treeX}
      height={trigger.bottomRight.treeY - trigger.topLeft.treeY}
    />
    <circle
      className="NodeCreationTriggerClickZone-indicator"
      cx={trigger.origin.treeX}
      cy={trigger.origin.treeY}
      r={8}
    />
    {'childIds' in trigger
      ? trigger.childPositions.map(childPosition => <line
        key={`${childPosition.treeX},${childPosition.treeY}`}
        className="NodeCreationTriggerClickZone-indicator"
        x1={trigger.origin.treeX}
        y1={trigger.origin.treeY}
        x2={childPosition.treeX}
        y2={childPosition.treeY - NODE_LEVEL_SPACING}
      />)
      : <line
        className="NodeCreationTriggerClickZone-indicator"
        x1={trigger.origin.treeX}
        y1={trigger.origin.treeY}
        x2={trigger.origin.treeX}
        y2={0}
      />}
  </g>;

const TreeView: React.FC<TreeViewProps> = ({
  treeId,
  tree,
  selectedNodeIds,
  nodeDragOffset,
  onNodeMouseDown,
  onSingleNodeSelect,
  onNodeCreationTriggerClick,
}) =>
  <g id={`tree-${treeId}`} style={{ transform: `translate(${tree.position.plotX}px, ${tree.position.plotY}px)` }}>
    {getNodeCreationTriggersForTree(strWidth)(tree).map(trigger => <NodeCreationTriggerClickZone
      trigger={trigger}
      key={'childIds' in trigger ? trigger.childIds.join() : trigger.slice.join()}
      onClick={() => onNodeCreationTriggerClick && onNodeCreationTriggerClick(trigger)}
    />)}
    {mapEntries(tree.nodes, ([nodeId, node]) =>
      renderNode(nodeId, node, tree.nodes, selectedNodeIds, nodeDragOffset, onNodeMouseDown, onSingleNodeSelect))}
  </g>;

export default TreeView;
