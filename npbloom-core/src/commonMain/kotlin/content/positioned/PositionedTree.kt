@file:OptIn(ExperimentalJsExport::class)

package content.positioned

import NoSuchNodeException
import content.Id
import content.IdMap
import content.Sentence
import content.TreeCommon

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
}
