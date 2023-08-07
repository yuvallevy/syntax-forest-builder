@file:OptIn(ExperimentalJsExport::class)

package content.unpositioned

import NoSuchNodeException
import content.*

@JsExport
data class UnpositionedTree(
    override val sentence: Sentence,
    val nodes: IdMap<UnpositionedNode>,
    val offset: PlotCoordsOffset,
) : TreeCommon {
    fun node(nodeId: Id) = nodes[nodeId] ?: throw NoSuchNodeException(nodeId)

    operator fun contains(nodeId: Id) = nodeId in nodes

    fun setNode(nodeId: Id, node: UnpositionedNode) = copy(nodes = nodes + (nodeId to node))

    fun removeNode(nodeId: Id) = copy(nodes = nodes - nodeId)

    /**
     * Inserts the given node into the tree, assigning it the given ID.
     */
    fun insertNode(node: InsertedNode, newNodeId: Id): UnpositionedTree =
        copy(nodes = nodes.insertNode(node, newNodeId))

    /**
     * Transforms the node with the given ID using the given transform function
     * at any point in the given tree.
     */
    fun transformNode(nodeId: Id, transformFunc: NodeTransformFunc): UnpositionedTree =
        copy(nodes = nodes.transformNodes(setOf(nodeId), transformFunc))

    /**
     * Transforms the nodes with the given IDs using the given transform function
     * at any point in the given tree.
     */
    fun transformNodes(nodeIds: Set<Id>, transformFunc: NodeTransformFunc): UnpositionedTree =
        copy(nodes = nodes.transformNodes(nodeIds, transformFunc))

    /**
     * Transforms all nodes in the given tree using the given transform function.
     */
    fun transformAllNodes(transformFunc: NodeTransformFunc): UnpositionedTree =
        copy(nodes = nodes.mapValues { (_, node) -> transformFunc(node) })

    /**
     * Deletes the nodes with the given IDs from the given tree.
     */
    fun deleteNodes(nodeIds: Set<Id>): UnpositionedTree =
        copy(nodes = nodes.deleteNodes(nodeIds))

    /**
     * Creates parent-child relationships between the given parent node and child nodes.
     * If any of the nodes to be adopted is already a child of another node, that relationship is severed first.
     * If any node ends up without children after the change, it becomes stranded.
     */
    fun adoptNodes(adoptingNodeId: Id, adoptedNodeIds: Set<Id>): UnpositionedTree =
        if (adoptingNodeId in adoptedNodeIds) this  // can't adopt yourself
        else {
            val treeWithoutExistingConnections =
                transformAllNodes { nodes.unassignAsChildren(adoptedNodeIds, it) }
            treeWithoutExistingConnections.transformNode(adoptingNodeId) {
                UnpositionedBranchingNode(
                    label = it.label,
                    offset = TreeCoordsOffset.ZERO,
                    children = (if (it is UnpositionedBranchingNode) it.children else emptySet()) + adoptedNodeIds
                )
            }
        }

    /**
     * Cuts parent-child relationships between the given parent node and child nodes.
     * If any node ends up without children after the change, it becomes stranded.
     */
    fun disownNodes(disowningNodeId: Id, disownedNodeIds: Set<Id>): UnpositionedTree =
        if (disowningNodeId in disownedNodeIds) this  // can't disown yourself
        else transformNode(disowningNodeId) { node -> nodes.unassignAsChildren(disownedNodeIds, node) }

    fun filterNodeIdsByNode(predicate: (node: UnpositionedNode) -> Boolean): Set<Id> =
        nodes.filterValues(predicate).keys

    fun getParentNodeIds(nodeIds: Set<Id>): Set<Id> =
        filterNodeIdsByNode { node ->
            node is UnpositionedBranchingNode && nodeIds.any { selectedNodeId -> selectedNodeId in node.children }
        }

    fun getChildNodeIds(nodeIds: Set<Id>): Set<Id> =
        nodeIds.flatMap { nodeId ->
            val node = nodes[nodeId]
            if (node is UnpositionedBranchingNode) node.children else emptySet()
        }.toSet()

    fun getNodeIdsAssignedToSlice(slice: StringSlice): Set<Id> =
        // If the slice is of length 0 (as in a zero-length selection),
        if (slice.isZeroLength)
        // check whether it is within the node slice or at either of its boundaries
            filterNodeIdsByNode { node -> node is UnpositionedTerminalNode && node.slice.start <= slice.start && slice.start <= node.slice.endExclusive }
        // otherwise use a simple overlap check where adjacent slices are not counted as overlapping
        else filterNodeIdsByNode { node -> node is UnpositionedTerminalNode && slicesOverlap(slice, node.slice) }
}
