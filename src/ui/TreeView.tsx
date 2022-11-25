import React from 'react';
import { mapEntries } from '../core/objTransforms';
import { Id, PositionedBranchingNode, PositionedNode, PositionedTerminalNode, PositionedTree } from '../core/types';

const NODE_LEVEL_SPACING = 20;
const TRIANGLE_BASE_Y = -2;

interface TreeViewProps {
  treeId: Id;
  tree: PositionedTree;
}

const renderChildNodeConnections = (node: PositionedBranchingNode): React.ReactNode[] =>
  mapEntries(node.children, ([childId, child]) =>
    <line
      key={`to-${childId}`}
      stroke="#000"
      x1={node.position.treeX}
      y1={node.position.treeY}
      x2={child.position.treeX}
      y2={child.position.treeY - NODE_LEVEL_SPACING}
    />
  );

const renderTriangleConnection = (nodeId: Id, node: PositionedTerminalNode): React.ReactNode =>
  node.triangle && <path
    key={`triangle-${nodeId}`}
    stroke="#000"
    fill="none"
    d={`M${node.position.treeX} ${node.position.treeY} L${node.triangle.treeX1} ${TRIANGLE_BASE_Y}  L${node.triangle.treeX2} ${TRIANGLE_BASE_Y} Z`}
  />;

const renderNodeFlat = ([nodeId, node]: [Id, PositionedNode]): React.ReactNode[] => [
  <text
    key={nodeId}
    x={node.position.treeX}
    y={node.position.treeY}
    fill="#000"
    textAnchor="middle"
    dominantBaseline="text-after-edge"
  >
    {node.label}
  </text>,
  'triangle' in node && renderTriangleConnection(nodeId, node),
  ...('children' in node)
    ? [
      ...renderChildNodeConnections(node),
      ...mapEntries(node.children, renderNodeFlat),
    ] : [],
];

const TreeView: React.FC<TreeViewProps> = ({ treeId, tree }) =>
  <g id={`tree-${treeId}`} style={{ transform: `translate(${tree.position.plotX}px, ${tree.position.plotY}px)` }}>
    {mapEntries(tree.nodes, renderNodeFlat)}
  </g>;

export default TreeView;
