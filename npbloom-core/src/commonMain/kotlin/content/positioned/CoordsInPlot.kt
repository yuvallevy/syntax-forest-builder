@file:OptIn(ExperimentalJsExport::class)

package content.positioned

import kotlin.js.ExperimentalJsExport
import kotlin.js.JsExport

@JsExport
data class CoordsInPlot(val plotX: PlotX, val plotY: PlotY)
