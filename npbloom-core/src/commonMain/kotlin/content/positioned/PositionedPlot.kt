@file:OptIn(ExperimentalJsExport::class)

package content.positioned

import NoSuchTreeException
import content.EntitySet
import content.Id
import content.NodeIndicatorInPlot

@JsExport
data class PositionedPlot(val trees: EntitySet<PositionedTree>) {
    fun tree(treeId: Id) = trees[treeId] ?: throw NoSuchTreeException(treeId)

    operator fun contains(treeId: Id) = treeId in trees

    /**
     * Returns a set of node indicators referring to nodes matching the given predicate.
     */
    fun filterNodeIndicatorsAsArray(predicate: (tree: PositionedTree, node: PositionedNode) -> Boolean) =
        trees.flatMap { tree ->
            tree.filterNodes { predicate(tree, it) }.ids.map { NodeIndicatorInPlot(tree.id, it) }
        }

    internal fun filterNodeIndicators(predicate: (tree: PositionedTree, node: PositionedNode) -> Boolean) =
        filterNodeIndicatorsAsArray(predicate).toSet()
}
