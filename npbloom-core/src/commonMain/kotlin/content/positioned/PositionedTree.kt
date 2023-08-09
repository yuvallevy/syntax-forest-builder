@file:OptIn(ExperimentalJsExport::class)

package content.positioned

import NoSuchNodeException
import content.*

@JsExport
data class PositionedTree(
    override val sentence: Sentence,
    val nodes: IdMap<PositionedNode>,
    val position: CoordsInPlot,
    val width: Width,
) : TreeCommon {
    fun node(nodeId: Id) = nodes[nodeId] ?: throw NoSuchNodeException(nodeId)

    operator fun contains(nodeId: Id) = nodeId in nodes

    fun <T> mapNodes(transformFunc: (nodeId: Id, node: PositionedNode) -> T) =
        nodes.map { (nodeId, node) -> transformFunc(nodeId, node) }.toTypedArray()

    /**
     * Returns nodes matching the given predicate in the given tree.
     */
    fun filterNodes(
        predicate: (node: PositionedNode) -> Boolean,
    ): IdMap<PositionedNode> = nodes.filterValues(predicate)

    /**
     * Returns nodes with the given IDs in the given tree.
     */
    fun filterNodesById(nodeIds: Set<Id>): IdMap<PositionedNode> =
        nodes.filterKeys { it in nodeIds }

    /**
     * Returns an ID map consisting of the top-level nodes in the given tree.
     */
    fun getTopLevelNodes(): IdMap<PositionedNode> =
        nodes.filterKeys { isPositionedNodeTopLevel(nodes, it) }

    /**
     * Receives an array of node IDs in the given tree and returns them sorted by X-coordinate.
     */
    fun sortNodesByXCoord(nodeIds: Set<Id>): Array<Id> =
        nodeIds.sortedBy { nodes[it]!!.position.treeX }.toTypedArray()

    /**
     * Returns true if there are no nodes assigned to any slices overlapping the given one.
     */
    fun isSliceUnassigned(slice: StringSlice) =
        nodes.none { (_, node) -> node is PositionedTerminalNode && slicesOverlap(node.slice, slice) }
}
