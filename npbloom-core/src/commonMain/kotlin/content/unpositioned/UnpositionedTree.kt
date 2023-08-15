@file:OptIn(ExperimentalJsExport::class)

package content.unpositioned

import NoSuchNodeException
import content.*

@JsExport
data class UnpositionedTree(
    override val id: Id,
    override val sentence: Sentence,
    val nodes: EntitySet<UnpositionedNode>,
    val offset: PlotCoordsOffset,
) : TreeBase {
    internal val nodeIds get() = nodes.ids

    val nodesAsArray get() = nodes.toTypedArray()

    val nodeCount get() = nodes.size

    val hasNodes get() = nodes.isNotEmpty()

    fun node(nodeId: Id) = nodes[nodeId] ?: throw NoSuchNodeException(nodeId)

    internal operator fun contains(nodeId: Id) = nodeId in nodes

    internal fun setNode(node: UnpositionedNode) = copy(nodes = nodes + node)

    internal fun removeNode(nodeId: Id) = copy(nodes = nodes - nodeId)

    fun anyNodes(predicate: (node: UnpositionedNode) -> Boolean) = nodes.any(predicate)

    /**
     * Determines whether this tree is "complete" by checking whether it has only one undominated node.
     * This is a bad metric because a tree can have a single undominated node without being complete.
     * TODO: Make this smarter
     */
    val isComplete: Boolean get() {
        val allChildIds = nodes.flatMap { if (it is UnpositionedBranchingNode) it.children else emptySet() }
            .toSet()
        val topLevelNodeIds = (nodeIds - allChildIds).toList()
        return topLevelNodeIds.singleOrNull()?.let { node(it).label.isNotEmpty() } ?: false
    }

    /**
     * Inserts the given node into the tree, assigning it the given ID.
     */
    internal fun insertNode(node: InsertedNode): UnpositionedTree =
        copy(nodes = nodes.insertNode(node))

    /**
     * Transforms the node with the given ID using the given transform function
     * at any point in the given tree.
     */
    internal fun transformNode(nodeId: Id, transformFunc: NodeTransformFunc): UnpositionedTree =
        copy(nodes = nodes.transformNodes(setOf(nodeId), transformFunc))

    /**
     * Transforms the nodes with the given IDs using the given transform function
     * at any point in the given tree.
     */
    internal fun transformNodes(nodeIds: Set<Id>, transformFunc: NodeTransformFunc): UnpositionedTree =
        copy(nodes = nodes.transformNodes(nodeIds, transformFunc))

    /**
     * Transforms all nodes in the given tree using the given transform function.
     */
    internal fun transformAllNodes(transformFunc: NodeTransformFunc): UnpositionedTree =
        copy(nodes = EntitySet(*nodes.map(transformFunc)))

    /**
     * Deletes the nodes with the given IDs from the given tree.
     */
    internal fun deleteNodes(nodeIds: Set<Id>): UnpositionedTree =
        copy(nodes = nodes.deleteNodes(nodeIds))

    /**
     * Creates parent-child relationships between the given parent node and child nodes.
     * If any of the nodes to be adopted is already a child of another node, that relationship is severed first.
     * If any node ends up without children after the change, it becomes stranded.
     */
    internal fun adoptNodes(adoptingNodeId: Id, adoptedNodeIds: Set<Id>): UnpositionedTree =
        if (adoptingNodeId in adoptedNodeIds) this  // can't adopt yourself
        else {
            val treeWithoutExistingConnections =
                transformAllNodes { nodes.unassignAsChildren(adoptedNodeIds, it) }
            treeWithoutExistingConnections.transformNode(adoptingNodeId) {
                UnpositionedBranchingNode(
                    id = it.id,
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
    internal fun disownNodes(disowningNodeId: Id, disownedNodeIds: Set<Id>): UnpositionedTree =
        if (disowningNodeId in disownedNodeIds) this  // can't disown yourself
        else transformNode(disowningNodeId) { node -> nodes.unassignAsChildren(disownedNodeIds, node) }

    internal fun filterNodeIdsByNode(predicate: (node: UnpositionedNode) -> Boolean): Set<Id> =
        nodes.filter(predicate).ids

    internal fun getParentNodeIds(nodeIds: Set<Id>): Set<Id> =
        filterNodeIdsByNode { node ->
            node is UnpositionedBranchingNode && nodeIds.any { selectedNodeId -> selectedNodeId in node.children }
        }

    internal fun getChildNodeIds(nodeIds: Set<Id>): Set<Id> =
        nodeIds.flatMap { nodeId ->
            val node = nodes[nodeId]
            if (node is UnpositionedBranchingNode) node.children else emptySet()
        }.toSet()

    internal fun getNodeIdsAssignedToSlice(slice: StringSlice): Set<Id> =
        // If the slice is of length 0 (as in a zero-length selection),
        if (slice.isZeroLength)
        // check whether it is within the node slice or at either of its boundaries
            filterNodeIdsByNode { node -> node is UnpositionedTerminalNode && node.slice.start <= slice.start && slice.start <= node.slice.endExclusive }
        // otherwise use a simple overlap check where adjacent slices are not counted as overlapping
        else filterNodeIdsByNode { node -> node is UnpositionedTerminalNode && slicesOverlap(slice, node.slice) }

    fun getNodeIdsAssignedToSliceAsArray(slice: StringSlice): Array<Id> =
        getNodeIdsAssignedToSlice(slice).toTypedArray()
}
