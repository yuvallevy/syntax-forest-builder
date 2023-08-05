@file:OptIn(ExperimentalJsExport::class)

package content.positioned

import content.IdMap
import content.Sentence
import content.TreeCommon

@JsExport
data class PositionedTree(
    override val sentence: Sentence,
    val nodes: IdMap<PositionedNode>,
    val position: CoordsInPlot,
    val width: Width,
) : TreeCommon
