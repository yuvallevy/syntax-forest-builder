@file:OptIn(ExperimentalJsExport::class)

package content.positioned

import NoSuchNodeException
import content.*

@JsExport
data class PositionedTree(
    override val id: Id,
    override val sentence: Sentence,
    val nodes: EntitySet<PositionedNode>,
    val position: CoordsInPlot,
    val width: Width,
) : TreeBase {
    fun node(nodeId: Id) = nodes[nodeId] ?: throw NoSuchNodeException(nodeId)

    internal operator fun contains(nodeId: Id) = nodeId in nodes

    /**
     * Returns nodes matching the given predicate in the given tree.
     */
    internal fun filterNodes(predicate: (node: PositionedNode) -> Boolean): EntitySet<PositionedNode> =
        nodes.filter(predicate)

    /**
     * Returns nodes with the given IDs in the given tree.
     */
    internal fun filterNodesById(nodeIds: Set<Id>): EntitySet<PositionedNode> = nodes.filter { it.id in nodeIds }

    /**
     * Returns an ID map consisting of the top-level nodes in the given tree.
     */
    internal fun getTopLevelNodes(): EntitySet<PositionedNode> =
        nodes.filter { isPositionedNodeTopLevel(nodes, it.id) }

    /**
     * Receives an array of node IDs in the given tree and returns them sorted by X-coordinate.
     */
    internal fun sortNodesByXCoord(nodeIds: Set<Id>): Array<Id> =
        nodeIds.sortedBy { nodes[it]!!.position.treeX }.toTypedArray()

    /**
     * Returns true if there are no nodes assigned to any slices overlapping the given one.
     */
    internal fun isSliceUnassigned(slice: StringSlice) =
        nodes.none { it is PositionedTerminalNode && it.slice overlapsWith slice }
}
