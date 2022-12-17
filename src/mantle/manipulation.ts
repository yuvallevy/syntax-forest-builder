import { omitKey, transformValues, without } from '../core/objTransforms';
import { Id, IdMap, isBranching, NodeCommon, NodeSlice, UnpositionedBranchingNode, UnpositionedNode, UnpositionedTree } from '../core/types';

export type NodeTransformFunc = (oldNode: UnpositionedNode) => UnpositionedNode;

type InsertedNodeCommon = NodeCommon & { targetParentId?: Id; }

type InsertedBranchingNode = InsertedNodeCommon & { targetChildIds: Id[]; };

type InsertedTerminalNode = InsertedNodeCommon & { targetSlice: NodeSlice; };

type InsertedNode = InsertedBranchingNode | InsertedTerminalNode;

const findNodeAndDescendantsRecursively =
  (nodeId: Id) =>
  (nodes: IdMap<UnpositionedNode>): UnpositionedNode | undefined =>
    nodes.hasOwnProperty(nodeId)
      ? nodes[nodeId]
      : Object.keys(nodes).length === 0
      ? undefined
      : findNodeAndDescendantsRecursively(nodeId)(Object.values(nodes).reduce((accum, node) => ({
        ...accum,
        ...isBranching(node) ? node.children : {},
      }), {} as IdMap<UnpositionedNode>));

const findNodesAndDescendantsRecursively =
  (nodeIds: Id[]) =>
  (nodes: IdMap<UnpositionedNode>): IdMap<UnpositionedNode> =>
    Object.keys(nodes).length === 0
      ? nodes
      : {
        ...nodeIds
          .filter(nodeId => nodes.hasOwnProperty(nodeId))
          .reduce((accum, nodeId) => ({ ...accum, [nodeId]: nodes[nodeId] }), {}),
        ...findNodesAndDescendantsRecursively(nodeIds)(Object.values(nodes).reduce((accum, node) => ({
          ...accum,
          ...isBranching(node) ? node.children : {},
        }), {})),
      };

const insertNodeRecursively =
  (insertedNode: InsertedNode) =>
  (nodeId: Id) =>
  (nodes: IdMap<UnpositionedNode>): IdMap<UnpositionedNode> =>
    insertedNode.targetParentId
      ? nodes.hasOwnProperty(insertedNode.targetParentId)
        ? {
          ...nodes,
          [insertedNode.targetParentId]: {
            ...nodes[insertedNode.targetParentId],
            children: insertNodeRecursively({
              ...insertedNode,
              targetParentId: undefined,
            })(nodeId)(
              isBranching(nodes[insertedNode.targetParentId])
                ? (nodes[insertedNode.targetParentId] as UnpositionedBranchingNode).children
                : {}
            ),
          },
        }
        : transformValues(
          nodes,
          node => isBranching(node) ? {
            ...node,
            children: insertNodeRecursively(insertedNode)(nodeId)(node.children),
          } : node,
        )
      : 'targetChildIds' in insertedNode
      ? {
        ...deleteNodesAndDescendantsRecursively(insertedNode.targetChildIds)(nodes),
        [nodeId]: {
          label: insertedNode.label,
          offset: { dTreeX: 0, dTreeY: 0 },
          children: findNodesAndDescendantsRecursively(insertedNode.targetChildIds)(nodes),
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

const transformNodeRecursively =
  (transformFunc: NodeTransformFunc) =>
  (nodeId: Id) =>
  (nodes: IdMap<UnpositionedNode>): IdMap<UnpositionedNode> =>
    nodes.hasOwnProperty(nodeId)
      ? {
        ...nodes,
        [nodeId]: transformFunc(nodes[nodeId]),
      }
      : transformValues(
        nodes,
        node => isBranching(node) ? {
          ...node,
          children: transformNodeRecursively(transformFunc)(nodeId)(node.children),
        } : node,
      );

const deleteNodeRecursively =
  (nodeId: Id) =>
  (nodes: IdMap<UnpositionedNode>): IdMap<UnpositionedNode> =>
    nodes.hasOwnProperty(nodeId)
      ? omitKey({
        ...nodes,
        ...isBranching(nodes[nodeId])
          ? (nodes[nodeId] as UnpositionedBranchingNode).children
          : {},
      }, nodeId)
      : transformValues(
        nodes,
        node => isBranching(node) ? {
          ...node,
          children: deleteNodeRecursively(nodeId)(node.children),
        } : node,
      );

const deleteNodesRecursively =
  (nodeIds: Id[]) =>
  (nodes: IdMap<UnpositionedNode>): IdMap<UnpositionedNode> =>
    nodeIds.length === 0 || Object.keys(nodes).length === 0
      ? nodes
      : nodeIds
        .filter(nodeId => nodes.hasOwnProperty(nodeId))
        .reduce((filteredNodes, nodeId) => omitKey(isBranching(nodes[nodeId]) ? {
          ...filteredNodes,
          ...deleteNodesRecursively(without(nodeIds, nodeId))((nodes[nodeId] as UnpositionedBranchingNode).children),
        } : filteredNodes, nodeId), transformValues(
          nodes,
          node => isBranching(node) ? {
            ...node,
            children: deleteNodesRecursively(nodeIds)(node.children),
          } : node,
        ));

const deleteNodesAndDescendantsRecursively =
  (nodeIds: Id[]) =>
  (nodes: IdMap<UnpositionedNode>): IdMap<UnpositionedNode> =>
    nodeIds.length === 0 || Object.keys(nodes).length === 0
      ? nodes
      : nodeIds
      .filter(nodeId => nodes.hasOwnProperty(nodeId))
      .reduce(
        (filteredNodes, nodeId) => omitKey(filteredNodes, nodeId),
        transformValues(
          nodes,
          node => isBranching(node) ? {
            ...node,
            children: deleteNodesRecursively(nodeIds)(node.children),
          } : node,
        ));

/**
 * Returns the node with the given ID in the given tree, or undefined if no node with this ID is found.
 */
export const findNodeInTree =
  (nodeId: Id) =>
  (tree: UnpositionedTree): UnpositionedNode | undefined =>
    findNodeAndDescendantsRecursively(nodeId)(tree.nodes);

/**
 * Inserts the given node into the tree, assigning it the given ID.
 */
export const insertNodeIntoTree =
  (node: InsertedNode) =>
  (newNodeId: Id) =>
  (tree: UnpositionedTree): UnpositionedTree => ({
    ...tree,
    nodes: insertNodeRecursively(node)(newNodeId)(tree.nodes),
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
    nodes: transformNodeRecursively(transformFunc)(nodeId)(tree.nodes),
  });

/**
 * Deletes the node with the given ID from the given tree.
 */
export const deleteNodesInTree =
  (nodeIds: Id[]) =>
  (tree: UnpositionedTree): UnpositionedTree => ({
    ...tree,
    nodes: deleteNodesRecursively(nodeIds)(tree.nodes),
  });
