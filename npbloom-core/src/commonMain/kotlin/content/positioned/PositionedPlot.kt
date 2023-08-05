@file:OptIn(ExperimentalJsExport::class)

package content.positioned

import content.IdMap

@JsExport
data class PositionedPlot(val trees: IdMap<PositionedTree>)
