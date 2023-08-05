@file:OptIn(ExperimentalJsExport::class)

package content.unpositioned

import content.IdMap
import content.Sentence
import content.TreeCommon

@JsExport
data class UnpositionedTree(
    override val sentence: Sentence,
    val nodes: IdMap<UnpositionedNode>,
    val offset: PlotCoordsOffset,
) : TreeCommon
