@file:OptIn(ExperimentalJsExport::class)

package content.positioned

import NoSuchTreeException
import content.Id
import content.IdMap
import content.NodeIndicatorInPlot

@JsExport
data class PositionedPlot(val trees: IdMap<PositionedTree>) {
    fun tree(treeId: Id) = trees[treeId] ?: throw NoSuchTreeException(treeId)

    operator fun contains(treeId: Id) = treeId in trees

    fun <T> mapTrees(transformFunc: (treeId: Id, tree: PositionedTree) -> T) =
        trees.map { (treeId, tree) -> transformFunc(treeId, tree) }.toTypedArray()

    /**
     * Returns a set of node indicators referring to nodes matching the given predicate.
     */
    fun filterNodeIndicators(predicate: (tree: PositionedTree, node: PositionedNode) -> Boolean): Set<NodeIndicatorInPlot> =
        trees.flatMap { (treeId, tree) ->
            tree.filterNodes { predicate(tree, it) }.keys.map { NodeIndicatorInPlot(treeId, it) }
        }.toSet()
}
