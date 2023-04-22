import { isEmpty, omitKeys, transformValues } from '../core/objTransforms';
import {
  Id, IdMap, isBranching, NodeCommon, StringSlice, UnpositionedBranchingNode, UnpositionedNode,
  UnpositionedStrandedNode, UnpositionedTree
} from '../core/types';

export type NodeTransformFunc = (oldNode: UnpositionedNode) => UnpositionedNode;

type NodeMapTransformFunc = (oldNodes: IdMap<UnpositionedNode>) => IdMap<UnpositionedNode>;

type InsertedNodeCommon = NodeCommon & { targetParentId?: Id; }

type InsertedBranchingNode = InsertedNodeCommon & { targetChildIds: Id[]; };

type InsertedTerminalNode = InsertedNodeCommon & { targetSlice: StringSlice; };

export type InsertedNode = InsertedBranchingNode | InsertedTerminalNode;

const isIn = (nodes: IdMap<UnpositionedNode>) => (nodeId: Id) => nodes.hasOwnProperty(nodeId);

const childrenOrEmpty = (node: UnpositionedNode) => isBranching(node) ? node.children : {};

const toStrandedNode = (node: UnpositionedNode): UnpositionedStrandedNode =>
  ({ label: node.label, offset: node.offset });

const transformChildrenOfNode =
  (nodeMapTransformFunc: NodeMapTransformFunc) =>
  (node: UnpositionedNode): UnpositionedNode =>
    isBranching(node) ? {
      ...node,
      children: nodeMapTransformFunc(node.children),
    } as UnpositionedBranchingNode : node;

const transformChildrenOfNodes =
  (nodeMapTransformFunc: NodeMapTransformFunc) =>
  (nodes: IdMap<UnpositionedNode>): IdMap<UnpositionedNode> =>
    transformValues(nodes, transformChildrenOfNode(nodeMapTransformFunc));

const findNodeAndDescendantsRecursively =
  (nodeId: Id) =>
  (nodes: IdMap<UnpositionedNode>): UnpositionedNode | undefined =>
    isIn(nodes)(nodeId)
      ? nodes[nodeId]
      : isEmpty(nodes)
      ? undefined
      : findNodeAndDescendantsRecursively(nodeId)(Object.values(nodes).reduce((accum, node) => ({
        ...accum,
        ...childrenOrEmpty(node),
      }), {} as IdMap<UnpositionedNode>));

const findNodesAndDescendantsRecursively =
  (nodeIds: Id[]) =>
  (nodes: IdMap<UnpositionedNode>): IdMap<UnpositionedNode> =>
    isEmpty(nodes)
      ? nodes
      : {
        ...nodeIds
          .filter(isIn(nodes))
          .reduce((accum, nodeId) => ({ ...accum, [nodeId]: nodes[nodeId] }), {}),
        ...findNodesAndDescendantsRecursively(nodeIds)(Object.values(nodes).reduce((accum, node) => ({
          ...accum,
          ...childrenOrEmpty(node),
        }), {})),
      };

const findDescendantsOfNodesRecursively =
  (nodeIds: Id[]) =>
  (nodes: IdMap<UnpositionedNode>): IdMap<UnpositionedNode> =>
    isEmpty(nodes)
      ? nodes
      : {
        ...nodeIds
          .filter(isIn(nodes))
          .reduce((accum, nodeId) => ({ ...accum, ...childrenOrEmpty(nodes[nodeId]) }), {}),
        ...findDescendantsOfNodesRecursively(nodeIds)(Object.values(nodes).reduce((accum, node) => ({
          ...accum,
          ...childrenOrEmpty(node),
        }), {})),
      };

const insertNodeAtTopLevel =
  (insertedNode: InsertedNode) =>
  (nodeId: Id) =>
  (nodes: IdMap<UnpositionedNode>): IdMap<UnpositionedNode> =>
    'targetChildIds' in insertedNode
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

const insertNodeRecursively =
  (insertedNode: InsertedNode) =>
  (nodeId: Id) =>
  (nodes: IdMap<UnpositionedNode>): IdMap<UnpositionedNode> =>
    insertedNode.targetParentId
      ? isIn(nodes)(insertedNode.targetParentId)
        ? {
          ...nodes,
          [insertedNode.targetParentId]: {
            ...nodes[insertedNode.targetParentId],
            children: insertNodeRecursively({
              ...insertedNode,
              targetParentId: undefined,
            })(nodeId)(childrenOrEmpty(nodes[insertedNode.targetParentId])),
          },
        }
        : transformChildrenOfNodes(insertNodeRecursively(insertedNode)(nodeId))(nodes)
      : insertNodeAtTopLevel(insertedNode)(nodeId)(nodes);

const transformNodeRecursively =
  (transformFunc: NodeTransformFunc) =>
  (nodeId: Id) =>
  (nodes: IdMap<UnpositionedNode>): IdMap<UnpositionedNode> =>
    isIn(nodes)(nodeId)
      ? {
        ...nodes,
        [nodeId]: transformFunc(nodes[nodeId]),
      }
      : transformChildrenOfNodes(transformNodeRecursively(transformFunc)(nodeId))(nodes);

const transformAllNodesRecursively =
  (transformFunc: NodeTransformFunc) =>
  (nodes: IdMap<UnpositionedNode>): IdMap<UnpositionedNode> =>
    isEmpty(nodes)
      ? nodes
      : transformChildrenOfNodes(transformAllNodesRecursively(transformFunc))(transformValues(nodes, transformFunc));

const deleteNodesAndDescendantsRecursively =
  (nodeIds: Id[]) =>
  (nodes: IdMap<UnpositionedNode>): IdMap<UnpositionedNode> => {
    if (isEmpty(nodeIds) || isEmpty(nodes)) return nodes;
    const filteredNodes = omitKeys(nodes, nodeIds);
    const nodesWithFilteredDescendants =
      transformChildrenOfNodes(deleteNodesAndDescendantsRecursively(nodeIds))(filteredNodes);
    return transformValues(
      nodesWithFilteredDescendants,
      node => isBranching(node) && Object.keys(node.children).length === 0 ? toStrandedNode(node) : node,
    );
  };

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
 * Transforms all nodes in the given tree using the given transform function.
 */
export const transformAllNodesInTree =
  (transformFunc: NodeTransformFunc) =>
  (tree: UnpositionedTree): UnpositionedTree => ({
    ...tree,
    nodes: transformAllNodesRecursively(transformFunc)(tree.nodes),
  });

/**
 * Deletes the node with the given ID from the given tree.
 */
export const deleteNodesInTree =
  (nodeIds: Id[]) =>
  (tree: UnpositionedTree): UnpositionedTree => ({
    ...tree,
    nodes: deleteNodesAndDescendantsRecursively(nodeIds)({
      ...tree.nodes,
      ...findDescendantsOfNodesRecursively(nodeIds)(tree.nodes),
    }),
  });
