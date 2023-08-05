@file:OptIn(ExperimentalJsExport::class)

package content.unpositioned

import content.*

typealias NodeTransformFunc = (oldNode: UnpositionedNode) -> UnpositionedNode

@JsExport
sealed interface InsertedNode : NodeCommon {
    override val label: NodeLabel
    val targetParentId: Id?
}

@JsExport
data class InsertedBranchingNode(
    override val label: NodeLabel,
    override val targetParentId: Id?,
    val targetChildIds: Set<Id>,
) : InsertedNode

@JsExport
data class InsertedTerminalNode(
    override val label: NodeLabel,
    override val targetParentId: Id?,
    val targetSlice: StringSlice,
    val triangle: Boolean,
) : InsertedNode

//fun isIn(nodes: IdMap<UnpositionedNode>, nodeId: Id) = nodeId in nodes

fun descendantIds(nodes: IdMap<UnpositionedNode>, node: UnpositionedBranchingNode): Set<Id> {
    val directChildren = node.children.map { nodes[it] }
    val indirectDescendantIds = directChildren
        .filterIsInstance<UnpositionedBranchingNode>()
        .flatMap { descendantIds(nodes, it) }
    return node.children + indirectDescendantIds
}

fun descendantsOf(nodes: IdMap<UnpositionedNode>, node: UnpositionedBranchingNode): IdMap<UnpositionedNode> =
    descendantIds(nodes, node).associateWith { nodes[it]!! }

fun toStrandedNode(oldNodes: IdMap<UnpositionedNode>, node: UnpositionedNode): UnpositionedStrandedNode =
    when (node) {
        is UnpositionedBranchingNode -> UnpositionedFormerlyBranchingNode(
            node.label,
            node.offset,
            descendantsOf(oldNodes, node),
        )

        is UnpositionedTerminalNode -> UnpositionedFormerlyTerminalNode(
            node.label,
            node.offset,
            node.slice,
            node.triangle
        )

        else -> UnpositionedPlainStrandedNode(node.label, node.offset)
    }

fun unassignAsChildren(nodeIds: Set<Id>, nodes: IdMap<UnpositionedNode>, node: UnpositionedNode): UnpositionedNode {
    if (node !is UnpositionedBranchingNode) return node
    val filteredChildren = node.children - nodeIds
    if (node.children == filteredChildren) return node
    if (filteredChildren.isEmpty()) return toStrandedNode(nodes, node)
    return node.copy(children = filteredChildren)
}

fun setNodeById(nodes: IdMap<UnpositionedNode>, nodeId: Id, newNode: UnpositionedNode) = nodes + (nodeId to newNode)

fun insertNode(insertedNode: InsertedNode, nodeId: Id, nodes: IdMap<UnpositionedNode>): IdMap<UnpositionedNode> {
    val nodeMapWithNewNode: IdMap<UnpositionedNode> = when (insertedNode) {
        is InsertedBranchingNode -> setNodeById(
            nodes.mapValues { (_, node) ->
                if (node is UnpositionedBranchingNode) node.copy(children = node.children - insertedNode.targetChildIds)
                else node
            },
            nodeId,
            UnpositionedBranchingNode(insertedNode.label, TreeCoordsOffset.ZERO, insertedNode.targetChildIds),
        )

        is InsertedTerminalNode -> setNodeById(
            nodes,
            nodeId,
            UnpositionedTerminalNode(
                insertedNode.label,
                TreeCoordsOffset.ZERO,
                insertedNode.targetSlice,
                insertedNode.triangle
            )
        )
    }
    return if (insertedNode.targetParentId != null) {
        transformNodes(
            { if (it is UnpositionedBranchingNode) it.copy(children = it.children + nodeId) else it },
            setOf(insertedNode.targetParentId!!),
            nodeMapWithNewNode,
        )
    } else nodeMapWithNewNode
}

fun transformNodes(transformFunc: NodeTransformFunc, nodeIds: Set<Id>, nodes: IdMap<UnpositionedNode>): IdMap<UnpositionedNode> =
    nodeIds.fold(nodes) { transformedNodes, nodeId ->
        if (nodeId in nodes) setNodeById(
            transformedNodes,
            nodeId,
            transformFunc(nodes[nodeId]!!)
        ) else transformedNodes
    }

fun deleteNodes(nodeIds: Set<Id>, nodes: IdMap<UnpositionedNode>): IdMap<UnpositionedNode> {
    if (nodeIds.isEmpty() || nodes.isEmpty()) return nodes
    val filteredNodes = nodes.filterKeys { it !in nodeIds }
    return filteredNodes.mapValues { (_, node) -> unassignAsChildren(nodeIds, nodes, node) }
}

/**
 * Inserts the given node into the tree, assigning it the given ID.
 */
@JsExport
fun insertNodeIntoTree(node: InsertedNode, newNodeId: Id, tree: UnpositionedTree): UnpositionedTree =
    tree.copy(nodes = insertNode(node, newNodeId, tree.nodes))

/**
 * Transforms the node with the given ID using the given transform function
 * at any point in the given tree.
 */
@JsExport
fun transformNodeInTree(transformFunc: NodeTransformFunc, nodeId: Id, tree: UnpositionedTree): UnpositionedTree =
    tree.copy(nodes = transformNodes(transformFunc, setOf(nodeId), tree.nodes))

/**
 * Transforms the nodes with the given IDs using the given transform function
 * at any point in the given tree.
 */
@JsExport
fun transformNodesInTree(transformFunc: NodeTransformFunc, nodeIds: Set<Id>, tree: UnpositionedTree): UnpositionedTree =
    tree.copy(nodes = transformNodes(transformFunc, nodeIds, tree.nodes))

/**
 * Transforms all nodes in the given tree using the given transform function.
 */
@JsExport
fun transformAllNodesInTree(transformFunc: NodeTransformFunc, tree: UnpositionedTree): UnpositionedTree =
    tree.copy(nodes = tree.nodes.mapValues { (_, node) -> transformFunc(node) })

/**
 * Deletes the nodes with the given IDs from the given tree.
 */
@JsExport
fun deleteNodesInTree(nodeIds: Set<Id>, tree: UnpositionedTree): UnpositionedTree =
    tree.copy(nodes = deleteNodes(nodeIds, tree.nodes))

/**
 * Creates parent-child relationships between the given parent node and child nodes.
 * If any of the nodes to be adopted is already a child of another node, that relationship is severed first.
 * If any node ends up without children after the change, it becomes stranded.
 */
@JsExport
fun adoptNodesInTree(adoptingNodeId: Id, adoptedNodeIds: Set<Id>, tree: UnpositionedTree): UnpositionedTree =
    if (adoptingNodeId in adoptedNodeIds) tree  // can't adopt yourself
    else {
        val treeWithoutExistingConnections =
            transformAllNodesInTree({ unassignAsChildren(adoptedNodeIds, tree.nodes, it) }, tree)
        transformNodeInTree({
            UnpositionedBranchingNode(
                label = it.label,
                offset = TreeCoordsOffset.ZERO,
                children = (if (it is UnpositionedBranchingNode) it.children else emptySet()) + adoptedNodeIds
            )
        }, adoptingNodeId, treeWithoutExistingConnections)
    }

/**
 * Cuts parent-child relationships between the given parent node and child nodes.
 * If any node ends up without children after the change, it becomes stranded.
 */
@JsExport
fun disownNodesInTree(disowningNodeId: Id, disownedNodeIds: Set<Id>, tree: UnpositionedTree): UnpositionedTree =
    if (disowningNodeId in disownedNodeIds) tree  // can't disown yourself
    else transformNodeInTree({ node -> unassignAsChildren(disownedNodeIds, tree.nodes, node) }, disowningNodeId, tree)

@JsExport
fun filterNodeIdsByNode(tree: UnpositionedTree, predicate: (node: UnpositionedNode) -> Boolean): Set<Id> =
    tree.nodes.filterValues(predicate).keys

@JsExport
fun getParentNodeIdsInTree(nodeIds: Set<Id>, tree: UnpositionedTree): Set<Id> =
    filterNodeIdsByNode(tree) { node ->
        node is UnpositionedBranchingNode && nodeIds.any { selectedNodeId -> selectedNodeId in node.children }
    }

@JsExport
fun getChildNodeIdsInTree(nodeIds: Set<Id>, tree: UnpositionedTree): Set<Id> =
    nodeIds.flatMap { nodeId ->
        val node = tree.nodes[nodeId]
        if (node is UnpositionedBranchingNode) node.children else emptySet()
    }.toSet()

@JsExport
fun getNodeIdsAssignedToSlice(slice: StringSlice, tree: UnpositionedTree): Set<Id> =
    // If the slice is of length 0 (as in a zero-length selection),
    if (slice.isZeroLength)
    // check whether it is within the node slice or at either of its boundaries
        filterNodeIdsByNode(tree) { node -> node is UnpositionedTerminalNode && node.slice.start <= slice.start && slice.start <= node.slice.endExclusive }
    // otherwise use a simple overlap check where adjacent slices are not counted as overlapping
    else filterNodeIdsByNode(tree) { node -> node is UnpositionedTerminalNode && slicesOverlap(slice, node.slice) }
