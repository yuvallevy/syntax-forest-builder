import React, { useContext } from 'react';
import {
  AddBranchingNodeByTarget, AddTerminalNodeByTarget, AdoptNodesBySelection, applyNodeSelection, applyTreeSelection,
  BranchingNodeCreationTrigger, calculateNodeCenterInTree, ClientCoordsOffset, coordsInPlotToCoordsInClient,
  DisownNodesBySelection, EntitySelectionAction, EntitySelectionMode, EntitySet, generateNodeId,
  getNodeCreationTriggers, isPositionedNodeTopLevel, NodeCreationTrigger, NodeIndicatorInPlot, NodeSelectionInPlot,
  PositionedBranchingNode, PositionedNode, PositionedTerminalNode, PositionedTree, SelectionInPlot, SetSelection,
  SliceSelectionInPlot, StartEditing, TerminalNodeCreationTrigger, TreeSelectionInPlot
} from 'npbloom-core';
import { Id } from '../types';
import './TreeView.scss';
import useUiState from '../useUiState';
import SettingsStateContext from '../SettingsStateContext';

const NODE_LEVEL_SPACING = 20;
const TRIANGLE_BASE_Y = -2;

const NODE_AREA_WIDTH = 35;
const NODE_AREA_HEIGHT = 20;
const NODE_AREA_RELATIVE_X = -(NODE_AREA_WIDTH / 2);
const NODE_AREA_RELATIVE_Y = -18.5;

const TREE_AREA_PADDING = 12;

interface NodeCreationTriggerClickZoneProps {
  trigger: NodeCreationTrigger;
  onClick?: () => void;
}

interface TreeViewProps {
  treeId: Id;
  tree: PositionedTree;
  nodeDragOffset?: ClientCoordsOffset;
  treeDragOffset?: ClientCoordsOffset;
  onNodeMouseDown?: (event: React.MouseEvent<SVGElement>) => void;
  onTreeMouseDown?: (event: React.MouseEvent<SVGElement>) => void;
}

const renderChildNodeConnections = (node: PositionedBranchingNode, allNodes: EntitySet<PositionedNode>): React.ReactNode[] =>
  node.childrenAsArray.map(childId => {
    const childNode = allNodes.get(childId);
    if (!childNode) return false;
    return <line
        key={`to-${childId}`}
        stroke="#000"
        x1={node.position.treeX}
        y1={node.position.treeY}
        x2={childNode.position.treeX}
        y2={childNode.position.treeY - (childNode.label ? NODE_LEVEL_SPACING : 0)}
      />;
    }
  );

const renderTriangleConnection = (nodeId: Id, node: PositionedTerminalNode): React.ReactNode =>
  node.triangle && <path
    key={`triangle-${nodeId}`}
    stroke="#000"
    fill="none"
    d={`M${node.position.treeX} ${node.position.treeY} L${node.triangle.treeX1} ${TRIANGLE_BASE_Y}  L${node.triangle.treeX2} ${TRIANGLE_BASE_Y} Z`}
  />;

const renderNodeMarking = (nodeId: Id, node: PositionedNode): React.ReactNode => {
  const nodeCenter = calculateNodeCenterInTree(node);

  return <circle
    key={`${nodeId}-marker`}
    className="TreeView--marker"
    cx={nodeCenter.treeX}
    cy={nodeCenter.treeY}
    r={20}
  />;
};

const renderNode = (
  nodeId: Id,
  node: PositionedNode,
  allNodes: EntitySet<PositionedNode>,
  selectedNodeIds: Id[],
  markedNodeIds: Id[],
  nodeDragOffset?: ClientCoordsOffset,
  onMouseDown?: (event: React.MouseEvent<SVGElement>) => void,
  onSelect?: (id: Id, mode: EntitySelectionMode) => void,
  onEditStart?: () => void,
): React.ReactNode[] => [
  <g
    key={nodeId}
    className={'TreeView--node' + (node.label ? '' : ' TreeView--node--empty-label')
      + (selectedNodeIds.includes(nodeId) ? ' TreeView--node--selected' : '')}
    onMouseDown={event => {
      onSelect && onSelect(nodeId, event.ctrlKey || event.metaKey ? EntitySelectionMode.AddToSelection : EntitySelectionMode.SetSelection);
      onMouseDown && onMouseDown(event);
    }}
    onDoubleClick={onEditStart}
  >
    <rect
      x={node.position.treeX + NODE_AREA_RELATIVE_X}
      y={node.position.treeY + NODE_AREA_RELATIVE_Y}
      width={NODE_AREA_WIDTH}
      height={NODE_AREA_HEIGHT}
      rx={3}
      ry={3}
    />
    {(isPositionedNodeTopLevel(allNodes, nodeId) || node.label) && <text
      x={node.position.treeX}
      y={node.position.treeY}
      fill="#000"
      textAnchor="middle"
      dominantBaseline="text-after-edge"
    >
      {node.label || '?'}
    </text>}
  </g>,
  nodeDragOffset && selectedNodeIds.includes(nodeId) && <rect
    key={`${nodeId}-ghost`}
    className="TreeView--ghost"
    x={node.position.treeX + NODE_AREA_RELATIVE_X + nodeDragOffset.dClientX}
    y={node.position.treeY + NODE_AREA_RELATIVE_Y + nodeDragOffset.dClientY}
    width={NODE_AREA_WIDTH}
    height={NODE_AREA_HEIGHT}
    rx={3}
    ry={3}
  />,
  node instanceof PositionedTerminalNode && renderTriangleConnection(nodeId, node),
  node instanceof PositionedBranchingNode && renderChildNodeConnections(node, allNodes),
  markedNodeIds.includes(nodeId) && renderNodeMarking(nodeId, node),
];

const NodeCreationTriggerClickZone: React.FC<NodeCreationTriggerClickZoneProps> = ({ trigger, onClick }) =>
  <g
    className="NodeCreationTriggerClickZone"
    onClick={onClick}
  >
    <rect
      className="NodeCreationTriggerClickZone--area"
      x={trigger.topLeft.treeX}
      y={trigger.topLeft.treeY}
      width={trigger.bottomRight.treeX - trigger.topLeft.treeX}
      height={trigger.bottomRight.treeY - trigger.topLeft.treeY}
    />
    <circle
      className="NodeCreationTriggerClickZone--indicator"
      cx={trigger.origin.treeX}
      cy={trigger.origin.treeY}
      r={8}
    />
    {trigger instanceof BranchingNodeCreationTrigger
      ? trigger.childPositions.map(childPosition =>
        childPosition ? <line
          key={`${childPosition.treeX},${childPosition.treeY}`}
          className="NodeCreationTriggerClickZone--indicator"
          x1={trigger.origin.treeX}
          y1={trigger.origin.treeY}
          x2={childPosition.treeX}
          y2={childPosition.treeY - NODE_LEVEL_SPACING}
        /> : null)
      : trigger instanceof TerminalNodeCreationTrigger && trigger.triangle ?
        <path
          className="NodeCreationTriggerClickZone--indicator"
          d={`M${trigger.origin.treeX} ${trigger.origin.treeY} L${trigger.triangle.treeX1} ${TRIANGLE_BASE_Y}  L${trigger.triangle.treeX2} ${TRIANGLE_BASE_Y} Z`}
        />
      : <line
        className="NodeCreationTriggerClickZone--indicator"
        x1={trigger.origin.treeX}
        y1={trigger.origin.treeY}
        x2={trigger.origin.treeX}
        y2={0}
      />}
  </g>;

const TreeView: React.FC<TreeViewProps> = ({
  treeId,
  tree,
  nodeDragOffset,
  treeDragOffset,
  onNodeMouseDown,
  onTreeMouseDown,
}) => {
  const { state, dispatch } = useUiState();
  const { strWidth } = useContext(SettingsStateContext);

  const selectedTreeIds = state.selection instanceof TreeSelectionInPlot ? state.selection.treeIdsAsArray : [];
  const selectedNodeIndicators = state.selection instanceof NodeSelectionInPlot
    ? state.selection.nodeIndicatorsAsArray : [];
  const selectedNodeIds = selectedNodeIndicators.map(({ nodeId }) => nodeId);
  const markedNodeIndicators = state.objectMarkings instanceof NodeSelectionInPlot
    ? state.objectMarkings.nodeIndicatorsAsArray : [];
  const markedNodeIds = markedNodeIndicators.map(({ nodeId }) => nodeId);

  const setSelection = (newSelection: SelectionInPlot) => dispatch(new SetSelection(newSelection));
  const startEditing = () => dispatch(new StartEditing());
  const adoptNodes = (adoptedNodeIndicators: NodeIndicatorInPlot[]) =>
    dispatch(new AdoptNodesBySelection(adoptedNodeIndicators));
  const disownNodes = (disownedNodeIndicators: NodeIndicatorInPlot[]) =>
    dispatch(new DisownNodesBySelection(disownedNodeIndicators));

  const handleSingleNodeSelect = (nodeId: Id, mode: EntitySelectionMode = EntitySelectionMode.SetSelection) =>
    state.selectionAction === EntitySelectionAction.Adopt ? adoptNodes([new NodeIndicatorInPlot(treeId, nodeId)])
      : state.selectionAction === EntitySelectionAction.Disown ? disownNodes([new NodeIndicatorInPlot(treeId, nodeId)])
      : setSelection(applyNodeSelection(mode, [new NodeIndicatorInPlot(treeId, nodeId)], selectedNodeIndicators));

  const handleSingleTreeSelect = (treeId: Id, mode: EntitySelectionMode = EntitySelectionMode.SetSelection) =>
    setSelection(applyTreeSelection(mode, [treeId], selectedTreeIds));

  const handleNodeCreationTriggerClick = (trigger: NodeCreationTrigger) => {
    if (trigger instanceof BranchingNodeCreationTrigger) {
      dispatch(new AddBranchingNodeByTarget(treeId, generateNodeId(), trigger.childIds));
    } else if (trigger instanceof TerminalNodeCreationTrigger) {
      dispatch(new AddTerminalNodeByTarget(treeId, generateNodeId(), trigger.slice, !!trigger.triangle));
    }
  };

  const treePositionInClient = coordsInPlotToCoordsInClient(tree.position, state.panZoomState);

  return <g id={`tree-${treeId}`}
            style={{ transform: `translate(${treePositionInClient.clientX}px, ${treePositionInClient.clientY}px) scale(${state.panZoomState.zoomLevel})` }}>
    {getNodeCreationTriggers(
      tree,
      strWidth,
      state.selection instanceof SliceSelectionInPlot ? state.selection.slice : null,
    ).map(trigger =>
      <NodeCreationTriggerClickZone
        trigger={trigger}
        key={trigger instanceof BranchingNodeCreationTrigger ? trigger.childIds.join()
          : `${(trigger as TerminalNodeCreationTrigger).slice.start},${(trigger as TerminalNodeCreationTrigger).slice.endExclusive}`}
        onClick={() => handleNodeCreationTriggerClick(trigger)}
      />)}
    {tree.nodes.map(node =>
      renderNode(node.id, node, tree.nodes, selectedNodeIds, markedNodeIds, nodeDragOffset, onNodeMouseDown,
        handleSingleNodeSelect, startEditing))}
    {state.selectionAction === EntitySelectionAction.SelectTree && <>
      <rect
        x={-TREE_AREA_PADDING}
        y={-tree.height - NODE_AREA_HEIGHT - TREE_AREA_PADDING}
        width={tree.width + TREE_AREA_PADDING * 2}
        height={tree.height + NODE_AREA_HEIGHT + TREE_AREA_PADDING * 2}
        rx={3}
        ry={3}
        onMouseDown={event => {
          handleSingleTreeSelect(treeId, event.ctrlKey || event.metaKey ? EntitySelectionMode.AddToSelection : EntitySelectionMode.SetSelection);
          onTreeMouseDown && onTreeMouseDown(event);
        }}
        className={'TreeView--tree-area' + (selectedTreeIds.includes(treeId) ? ' TreeView--tree-area--selected' : '')}
      />
      {treeDragOffset && selectedTreeIds.includes(treeId) && <rect
        className="TreeView--ghost"
        x={-TREE_AREA_PADDING + treeDragOffset.dClientX}
        y={-tree.height - NODE_AREA_HEIGHT - TREE_AREA_PADDING + treeDragOffset.dClientY}
        width={tree.width + TREE_AREA_PADDING * 2}
        height={tree.height + NODE_AREA_HEIGHT + TREE_AREA_PADDING * 2}
        rx={3}
        ry={3}
      />}
    </>}
  </g>;
};

export default TreeView;
