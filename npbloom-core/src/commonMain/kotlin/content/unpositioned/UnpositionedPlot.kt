@file:OptIn(ExperimentalJsExport::class)

package content.unpositioned

import NoSuchTreeException
import content.EntitySet
import content.Id
import content.NodeIndicatorInPlot
import kotlinx.serialization.Serializable

@JsExport
@Serializable
data class UnpositionedPlot internal constructor(val trees: EntitySet<UnpositionedTree> = EntitySet()) {
    val isEmpty get() = trees.isEmpty()

    val treesAsArray get() = trees.toTypedArray()

    val treeCount get() = trees.size

    fun tree(treeId: Id) = trees[treeId] ?: throw NoSuchTreeException(treeId)

    internal operator fun contains(treeId: Id) = treeId in trees

    internal operator fun contains(nodeIndicator: NodeIndicatorInPlot) =
        nodeIndicator.treeId in this && nodeIndicator.nodeId in tree(nodeIndicator.treeId)

    internal fun setTree(tree: UnpositionedTree) = copy(trees = trees + tree)

    internal fun removeTree(treeId: Id) = copy(trees = trees - treeId)

    /**
     * Returns a list of tree and node IDs referring to the parents of the given nodes.
     */
    internal fun getParentNodeIds(nodeIndicators: Set<NodeIndicatorInPlot>): Set<NodeIndicatorInPlot> =
        groupNodeIdsByTree(nodeIndicators).flatMap { (treeId, nodeIds) ->
            trees[treeId]!!.getParentNodeIds(nodeIds).map { NodeIndicatorInPlot(treeId, it) }
        }.toSet()

    /**
     * Returns a list of tree and node IDs referring to the children of the given nodes.
     */
    internal fun getChildNodeIds(nodeIndicators: Set<NodeIndicatorInPlot>): Set<NodeIndicatorInPlot> =
        groupNodeIdsByTree(nodeIndicators).flatMap { (treeId, nodeIds) ->
            trees[treeId]!!.getChildNodeIds(nodeIds).map { NodeIndicatorInPlot(treeId, it) }
        }.toSet()

    /**
     * Returns whether all given nodes are top-level nodes.
     */
    internal fun allTopLevel(nodeIndicators: Set<NodeIndicatorInPlot>): Boolean =
        this.getParentNodeIds(nodeIndicators).isEmpty()

    fun allTopLevel(nodeIndicators: Array<NodeIndicatorInPlot>): Boolean =
        this.getParentNodeIds(nodeIndicators.toSet()).isEmpty()

    /**
     * Transforms the nodes with the given indicators using the given transform function
     * at any point in any tree in the given plot.
     */
    internal fun transformNodes(
        nodeIndicators: Set<NodeIndicatorInPlot>,
        transformFunc: NodeTransformFunc,
    ): UnpositionedPlot =
        copy(
            trees = trees + groupNodeIdsByTree(nodeIndicators).mapValues { (treeId, nodeIds) ->
                trees[treeId]!!.transformNodes(nodeIds, transformFunc)
            }.values
        )

    /**
     * Deletes the nodes with the given indicators from the given plot.
     */
    internal fun deleteNodes(nodeIndicators: Set<NodeIndicatorInPlot>) =
        copy(
            trees = trees + groupNodeIdsByTree(nodeIndicators).mapValues { (treeId, nodeIds) ->
                trees[treeId]!!.deleteNodes(nodeIds)
            }.values
        )
}

/**
 * Returns the given list of tree and node IDs as a mapping from tree ID to node IDs.
 */
private fun groupNodeIdsByTree(nodeIndicators: Set<NodeIndicatorInPlot>): Map<Id, Set<Id>> =
    nodeIndicators.groupBy { it.treeId }.mapValues { (_, nodeIndicators) -> nodeIndicators.map { it.nodeId }.toSet() }
