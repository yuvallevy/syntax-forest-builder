import React from 'react';
import { mapEntries } from '../core/objTransforms';
import {
  Id, IdMap, PositionedBranchingNode, PositionedNode, PositionedTerminalNode, PositionedTree
} from '../core/types';
import './TreeView.scss';
import { NodeSelectionMode } from './NodeSelectionMode';

const NODE_LEVEL_SPACING = 20;
const TRIANGLE_BASE_Y = -2;

interface TreeViewProps {
  treeId: Id;
  tree: PositionedTree;
  selectedNodeIds: Id[];
  onSingleNodeSelect?: (nodeId: Id, mode: NodeSelectionMode) => void;
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
  onSelect?: (id: Id, mode: NodeSelectionMode) => void
): React.ReactNode[] => [
  <text
    key={nodeId}
    x={node.position.treeX}
    y={node.position.treeY}
    className={'TreeView-node' + (selectedNodeIds.includes(nodeId) ? ' TreeView-node-selected' : '')}
    fill="#000"
    textAnchor="middle"
    dominantBaseline="text-after-edge"
    onMouseDown={event => onSelect && onSelect(nodeId, event.ctrlKey || event.metaKey ? 'ADD' : 'SET')}
  >
    {node.label}
  </text>,
  'triangle' in node && renderTriangleConnection(nodeId, node),
  'children' in node && renderChildNodeConnections(node, allNodes),
];

const TreeView: React.FC<TreeViewProps> = ({ treeId, tree, selectedNodeIds, onSingleNodeSelect }) =>
  <g id={`tree-${treeId}`} style={{ transform: `translate(${tree.position.plotX}px, ${tree.position.plotY}px)` }}>
    {mapEntries(tree.nodes, ([nodeId, node]) => renderNode(nodeId, node, tree.nodes, selectedNodeIds, onSingleNodeSelect))}
  </g>;

export default TreeView;
