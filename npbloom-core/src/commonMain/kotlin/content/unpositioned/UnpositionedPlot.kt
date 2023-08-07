@file:OptIn(ExperimentalJsExport::class)

package content.unpositioned

import NoSuchTreeException
import content.Id
import content.IdMap

@JsExport
data class UnpositionedPlot(val trees: IdMap<UnpositionedTree> = emptyMap()) {
    fun tree(treeId: Id) = trees[treeId] ?: throw NoSuchTreeException(treeId)

    operator fun contains(treeId: Id) = treeId in trees

    fun setTree(treeId: Id, tree: UnpositionedTree) = copy(trees = trees + (treeId to tree))

    fun removeTree(treeId: Id) = copy(trees = trees - treeId)

    fun <T> mapTrees(transformFunc: (treeId: Id, tree: UnpositionedTree) -> T) =
        trees.map { (treeId, tree) -> transformFunc(treeId, tree) }.toTypedArray()
}
