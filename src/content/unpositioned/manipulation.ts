import { associateWith, filterEntries, flatten, isEmpty, omitKeys, transformValues } from '../../util/objTransforms';
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

const toStrandedNode = (oldNodes: IdMap<UnpositionedNode>) => (node: UnpositionedNode): UnpositionedStrandedNode => ({
  label: node.label,
  offset: node.offset,
  formerDescendants: isBranching(node) ? descendantsOf(oldNodes)(node) : undefined,
  formerSlice: isTerminal(node) ? node.slice : undefined,
  formerlyTriangle: isTerminal(node) ? node.triangle : undefined,
});

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
    return transformValues(filteredNodes, node => {
      if (!isBranching(node)) return node;
      const filteredChildren = node.children.filter(childId => !nodeIds.includes(childId));
      if (node.children.length === filteredChildren.length) return node;
      if (isEmpty(filteredChildren)) return toStrandedNode(nodes)(node);
      return { ...node, children: filteredChildren };
    });
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
 * Deletes the node with the given IDs from the given tree.
 */
export const deleteNodesInTree =
  (nodeIds: Id[]) =>
  (tree: UnpositionedTree): UnpositionedTree => ({
    ...tree,
    nodes: deleteNodes(nodeIds)(tree.nodes),
  });

export const getParentNodeIdsInTree =
  (nodeIds: Id[]) =>
  (tree: UnpositionedTree): Id[] =>
    Object.keys(filterEntries(tree.nodes, ([_, node]) =>
      isBranching(node) && nodeIds.some(selectedNodeId => node.children.includes(selectedNodeId))));

export const getNodeIdsAssignedToSlice =
  (slice: StringSlice) =>
  (tree: UnpositionedTree): Id[] =>
    Object.keys(filterEntries(tree.nodes, ([_, node]) =>
      isTerminal(node) && slicesOverlap(slice, node.slice)));
