@file:OptIn(ExperimentalJsExport::class)

package content.unpositioned

import NoSuchNodeException
import content.Id
import content.IdMap
import content.Sentence
import content.TreeCommon

@JsExport
data class UnpositionedTree(
    override val sentence: Sentence,
    val nodes: IdMap<UnpositionedNode>,
    val offset: PlotCoordsOffset,
) : TreeCommon {
    fun node(nodeId: Id) = nodes[nodeId] ?: throw NoSuchNodeException(nodeId)

    operator fun contains(nodeId: Id) = nodeId in nodes

    fun setNode(nodeId: Id, node: UnpositionedNode) = copy(nodes = nodes + (nodeId to node))

    fun removeNode(nodeId: Id) = copy(nodes = nodes - nodeId)
}
