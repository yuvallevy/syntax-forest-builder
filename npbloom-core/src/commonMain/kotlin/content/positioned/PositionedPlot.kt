@file:OptIn(ExperimentalJsExport::class)

package content.positioned

import NoSuchTreeException
import content.Id
import content.IdMap

@JsExport
data class PositionedPlot(val trees: IdMap<PositionedTree>) {
    fun tree(treeId: Id) = trees[treeId] ?: throw NoSuchTreeException(treeId)

    operator fun contains(treeId: Id) = treeId in trees
}
