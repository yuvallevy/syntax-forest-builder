@file:OptIn(ExperimentalJsExport::class)

package content.unpositioned

import content.IdMap

@JsExport
data class UnpositionedPlot(val trees: IdMap<UnpositionedTree> = emptyMap())
