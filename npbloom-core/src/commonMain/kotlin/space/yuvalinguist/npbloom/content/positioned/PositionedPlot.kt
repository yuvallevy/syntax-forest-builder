@file:OptIn(ExperimentalJsExport::class)

package space.yuvalinguist.npbloom.content.positioned

import space.yuvalinguist.npbloom.NoSuchTreeException
import space.yuvalinguist.npbloom.content.EntitySet
import space.yuvalinguist.npbloom.content.Id
import space.yuvalinguist.npbloom.content.NodeIndicatorInPlot
import kotlin.js.ExperimentalJsExport
import kotlin.js.JsExport

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
        }.toTypedArray()

    internal fun filterNodeIndicators(predicate: (tree: PositionedTree, node: PositionedNode) -> Boolean) =
        filterNodeIndicatorsAsArray(predicate).toSet()
}
