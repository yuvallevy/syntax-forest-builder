@file:OptIn(ExperimentalJsExport::class)

package space.yuvalinguist.npbloom.content.positioned

import kotlinx.serialization.Serializable
import space.yuvalinguist.npbloom.content.serializers.CoordsInPlotSerializer
import space.yuvalinguist.npbloom.content.unpositioned.PlotCoordsOffset
import kotlin.js.ExperimentalJsExport
import kotlin.js.JsExport

@JsExport
@Serializable(CoordsInPlotSerializer::class)
data class CoordsInPlot(val plotX: PlotX, val plotY: PlotY) {
    operator fun plus(offsetD: PlotCoordsOffset): CoordsInPlot {
        return CoordsInPlot(plotX + offsetD.dPlotX, plotY + offsetD.dPlotY)
    }

    companion object {
        val ZERO = CoordsInPlot(0.0, 0.0)
    }
}
