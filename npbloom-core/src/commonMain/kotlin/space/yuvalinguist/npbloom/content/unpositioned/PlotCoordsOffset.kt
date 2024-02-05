@file:OptIn(ExperimentalJsExport::class)

package space.yuvalinguist.npbloom.content.unpositioned

import space.yuvalinguist.npbloom.content.serializers.PlotCoordsOffsetSerializer
import kotlinx.serialization.Serializable
import kotlin.js.ExperimentalJsExport
import kotlin.js.JsExport

typealias DPlotX = Double
typealias DPlotY = Double

@JsExport
@Serializable(PlotCoordsOffsetSerializer::class)
data class PlotCoordsOffset(val dPlotX: DPlotX, val dPlotY: DPlotY) {
    internal operator fun plus(other: PlotCoordsOffset) =
        PlotCoordsOffset(dPlotX + other.dPlotX, dPlotY + other.dPlotY)

    internal operator fun minus(toPlotCoordsOffset: PlotCoordsOffset) =
        PlotCoordsOffset(dPlotX - toPlotCoordsOffset.dPlotX, dPlotY - toPlotCoordsOffset.dPlotY)

    internal operator fun times(factor: Double) =
        PlotCoordsOffset(dPlotX * factor, dPlotY * factor)

    internal operator fun div(factor: Double) =
        PlotCoordsOffset(dPlotX / factor, dPlotY / factor)

    internal companion object {
        val ZERO = PlotCoordsOffset(0.0, 0.0)
    }
}
