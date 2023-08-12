@file:OptIn(ExperimentalJsExport::class)

package content.unpositioned

import NoSuchTreeException
import content.Id
import content.IdMap
import content.NodeIndicatorInPlot
import content.renderIdMap

@JsExport
data class UnpositionedPlot(val trees: IdMap<UnpositionedTree> = emptyMap()) {
    val isEmpty get() = trees.isEmpty()

    val treesAsArray get() = trees.values.toTypedArray()

    val treeCount get() = trees.size

    fun tree(treeId: Id) = trees[treeId] ?: throw NoSuchTreeException(treeId)

    operator fun contains(treeId: Id) = treeId in trees

    @JsName("containsIndicator")
    operator fun contains(nodeIndicator: NodeIndicatorInPlot) =
        nodeIndicator.treeId in this && nodeIndicator.nodeId in tree(nodeIndicator.treeId)

    fun setTree(treeId: Id, tree: UnpositionedTree) = copy(trees = trees + (treeId to tree))

    fun removeTree(treeId: Id) = copy(trees = trees - treeId)

    fun <T> mapTrees(transformFunc: (treeId: Id, tree: UnpositionedTree) -> T) =
        trees.map { (treeId, tree) -> transformFunc(treeId, tree) }.toTypedArray()

    /**
     * Returns a list of tree and node IDs referring to the parents of the given nodes.
     */
    fun getParentNodeIds(nodeIndicators: Set<NodeIndicatorInPlot>): Set<NodeIndicatorInPlot> =
        groupNodeIdsByTree(nodeIndicators).flatMap { (treeId, nodeIds) ->
            trees[treeId]!!.getParentNodeIds(nodeIds).map { NodeIndicatorInPlot(treeId, it) }
        }.toSet()

    /**
     * Returns a list of tree and node IDs referring to the children of the given nodes.
     */
    fun getChildNodeIds(nodeIndicators: Set<NodeIndicatorInPlot>): Set<NodeIndicatorInPlot> =
        groupNodeIdsByTree(nodeIndicators).flatMap { (treeId, nodeIds) ->
            trees[treeId]!!.getChildNodeIds(nodeIds).map { NodeIndicatorInPlot(treeId, it) }
        }.toSet()

    /**
     * Returns whether all given nodes are top-level nodes.
     */
    fun allTopLevel(nodeIndicators: Set<NodeIndicatorInPlot>): Boolean =
        this.getParentNodeIds(nodeIndicators).isEmpty()

    /**
     * Transforms the nodes with the given indicators using the given transform function
     * at any point in any tree in the given plot.
     */
    fun transformNodes(
        nodeIndicators: Set<NodeIndicatorInPlot>,
        transformFunc: NodeTransformFunc,
    ): UnpositionedPlot =
        copy(
            trees = trees + groupNodeIdsByTree(nodeIndicators).mapValues { (treeId, nodeIds) ->
                trees[treeId]!!.transformNodes(nodeIds, transformFunc)
            }
        )

    /**
     * Deletes the nodes with the given indicators from the given plot.
     */
    fun deleteNodes(nodeIndicators: Set<NodeIndicatorInPlot>): UnpositionedPlot =
        copy(
            trees = trees + groupNodeIdsByTree(nodeIndicators).mapValues { (treeId, nodeIds) ->
                trees[treeId]!!.deleteNodes(nodeIds)
            }
        )
}

/**
 * Returns the given list of tree and node IDs as a mapping from tree ID to node IDs.
 */
private fun groupNodeIdsByTree(nodeIndicators: Set<NodeIndicatorInPlot>): Map<Id, Set<Id>> =
    nodeIndicators.groupBy { it.treeId }.mapValues { (_, nodeIndicators) -> nodeIndicators.map { it.nodeId }.toSet() }
