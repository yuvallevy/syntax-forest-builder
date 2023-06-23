import {
  associateWith, filterEntries, flatten, isEmpty, omitKeys, transformValues, without
} from '../../util/objTransforms';
import {
  Id, IdMap, NodeCommon, StringSlice
} from '../types';
import {
  isBranching, isTerminal, UnpositionedBranchingNode, UnpositionedNode, UnpositionedStrandedNode, UnpositionedTree
} from './types';
import slicesOverlap from '../slicesOverlap';

export type NodeTransformFunc = (oldNode: UnpositionedNode) => UnpositionedNode;

type InsertedNodeCommon = NodeCommon & { targetParentId?: Id; }

type InsertedBranchingNode = InsertedNodeCommon & { targetChildIds: Id[]; };

type InsertedTerminalNode = InsertedNodeCommon & { targetSlice: StringSlice; };

export type InsertedNode = InsertedBranchingNode | InsertedTerminalNode;

const isIn = (nodes: IdMap<UnpositionedNode>) => (nodeId: Id) => nodes.hasOwnProperty(nodeId);

const descendantIds = (nodes: IdMap<UnpositionedNode>) => (node: UnpositionedBranchingNode): Id[] => {
  const directChildren = node.children.map(childId => nodes[childId]);
  const indirectDescendantIds = flatten(directChildren.filter(isBranching).map(descendantIds(nodes)));
  return [...node.children, ...indirectDescendantIds];
}

const descendantsOf = (nodes: IdMap<UnpositionedNode>) => (node: UnpositionedBranchingNode): IdMap<UnpositionedNode> =>
  associateWith(descendantIds(nodes)(node), childId => nodes[childId]);

const toStrandedNode = (oldNodes: IdMap<UnpositionedNode>) => (node: UnpositionedNode): UnpositionedStrandedNode =>
  isBranching(node) ? ({
    label: node.label,
    offset: node.offset,
    formerDescendants: descendantsOf(oldNodes)(node),
  }) : isTerminal(node) ? ({
    label: node.label,
    offset: node.offset,
    formerSlice: node.slice,
    formerlyTriangle: node.triangle,
  }) : node;

const unassignAsChildren = (nodeIds: Id[]) => (nodes: IdMap<UnpositionedNode>) => (node: UnpositionedNode) => {
  if (!isBranching(node)) return node;
  const filteredChildren = without(node.children, nodeIds);
  if (node.children.length === filteredChildren.length) return node;
  if (isEmpty(filteredChildren)) return toStrandedNode(nodes)(node);
  return { ...node, children: filteredChildren };
};

const insertNode =
  (insertedNode: InsertedNode) =>
  (nodeId: Id) =>
  (nodes: IdMap<UnpositionedNode>): IdMap<UnpositionedNode> => {
    const nodeMapWithNewNode = 'targetChildIds' in insertedNode
      ? {
        ...transformValues(nodes, node => isBranching(node)
          ? { ...node, children: node.children.filter(childId => !insertedNode.targetChildIds.includes(childId)) }
          : node),
        [nodeId]: {
          label: insertedNode.label,
          offset: { dTreeX: 0, dTreeY: 0 },
          children: insertedNode.targetChildIds,
        },
      }
      : {
        ...nodes,
        [nodeId]: {
          label: insertedNode.label,
          offset: { dTreeX: 0, dTreeY: 0 },
          slice: insertedNode.targetSlice,
          triangle: false,
        },
      };
    return insertedNode.targetParentId
      ? transformNodes(node =>
        isBranching(node) ? { ...node, children: [...node.children, nodeId] } : node)(
          [insertedNode.targetParentId])(nodeMapWithNewNode)
      : nodeMapWithNewNode;
  };

const transformNodes =
  (transformFunc: NodeTransformFunc) =>
  (nodeIds: Id[]) =>
  (nodes: IdMap<UnpositionedNode>): IdMap<UnpositionedNode> =>
    nodeIds.reduce((transformedNodes, nodeId) =>
      isIn(nodes)(nodeId)
        ? { ...transformedNodes, [nodeId]: transformFunc(nodes[nodeId]) }
        : transformedNodes,
      nodes
    );

const deleteNodes =
  (nodeIds: Id[]) =>
  (nodes: IdMap<UnpositionedNode>): IdMap<UnpositionedNode> => {
    if (isEmpty(nodeIds) || isEmpty(nodes)) return nodes;
    const filteredNodes = omitKeys(nodes, nodeIds);
    return transformValues(filteredNodes, node => unassignAsChildren(nodeIds)(nodes)(node));
  };

/**
 * Inserts the given node into the tree, assigning it the given ID.
 */
export const insertNodeIntoTree =
  (node: InsertedNode) =>
  (newNodeId: Id) =>
  (tree: UnpositionedTree): UnpositionedTree => ({
    ...tree,
    nodes: insertNode(node)(newNodeId)(tree.nodes),
  });

/**
 * Transforms the node with the given ID using the given transform function
 * at any point in the given tree.
 */
export const transformNodeInTree =
  (transformFunc: NodeTransformFunc) =>
  (nodeId: Id) =>
  (tree: UnpositionedTree): UnpositionedTree => ({
    ...tree,
    nodes: transformNodes(transformFunc)([nodeId])(tree.nodes),
  });

/**
 * Transforms the nodes with the given IDs using the given transform function
 * at any point in the given tree.
 */
export const transformNodesInTree =
  (transformFunc: NodeTransformFunc) =>
  (nodeIds: Id[]) =>
  (tree: UnpositionedTree): UnpositionedTree => ({
    ...tree,
    nodes: transformNodes(transformFunc)(nodeIds)(tree.nodes),
  });

/**
 * Transforms all nodes in the given tree using the given transform function.
 */
export const transformAllNodesInTree =
  (transformFunc: NodeTransformFunc) =>
  (tree: UnpositionedTree): UnpositionedTree => ({
    ...tree,
    nodes: transformValues(tree.nodes, transformFunc),
  });

/**
 * Deletes the nodes with the given IDs from the given tree.
 */
export const deleteNodesInTree =
  (nodeIds: Id[]) =>
  (tree: UnpositionedTree): UnpositionedTree => ({
    ...tree,
    nodes: deleteNodes(nodeIds)(tree.nodes),
  });

/**
 * Creates parent-child relationships between the given parent node and child nodes.
 * If any of the nodes to be adopted is already a child of another node, that relationship is severed first.
 * If any node ends up without children after the change, it becomes stranded.
 */
export const adoptNodesInTree =
  (adoptingNodeId: Id, adoptedNodeIds: Id[]) =>
  (tree: UnpositionedTree): UnpositionedTree =>
    adoptedNodeIds.includes(adoptingNodeId)
      ? tree  // can't adopt yourself
      : transformNodeInTree(node => ({
        label: node.label,
        offset: { dTreeX: 0, dTreeY: 0 },
        children: [...(isBranching(node) ? node.children : []), ...adoptedNodeIds],
      }))(adoptingNodeId)(transformAllNodesInTree(unassignAsChildren(adoptedNodeIds)(tree.nodes))(tree));

/**
 * Cuts parent-child relationships between the given parent node and child nodes.
 * If any node ends up without children after the change, it becomes stranded.
 */
export const disownNodesInTree =
  (disowningNodeId: Id, disownedNodeIds: Id[]) =>
  (tree: UnpositionedTree): UnpositionedTree =>
    disownedNodeIds.includes(disowningNodeId)
      ? tree  // can't disown yourself
      : transformNodeInTree(unassignAsChildren(disownedNodeIds)(tree.nodes))(disowningNodeId)(tree);

export const filterNodeIdsByNode =
  (tree: UnpositionedTree) =>
  (predicate: (node: UnpositionedNode) => boolean): Id[] =>
    Object.keys(filterEntries(tree.nodes, ([_, node]) => predicate(node)));

export const getParentNodeIdsInTree =
  (nodeIds: Id[]) =>
  (tree: UnpositionedTree): Id[] =>
    filterNodeIdsByNode(tree)(node =>
      isBranching(node) && nodeIds.some(selectedNodeId => node.children.includes(selectedNodeId)));

export const getNodeIdsAssignedToSlice =
  (slice: StringSlice) =>
  (tree: UnpositionedTree): Id[] =>
    filterNodeIdsByNode(tree)(node => isTerminal(node) && slicesOverlap(slice, node.slice));
