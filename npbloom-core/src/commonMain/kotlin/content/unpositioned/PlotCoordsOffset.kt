@file:OptIn(ExperimentalJsExport::class)

package content.unpositioned

import content.serializers.PlotCoordsOffsetSerializer
import kotlinx.serialization.Serializable

typealias DPlotX = Double
typealias DPlotY = Double

@JsExport
@Serializable(PlotCoordsOffsetSerializer::class)
data class PlotCoordsOffset(val dPlotX: DPlotX, val dPlotY: DPlotY) {
    internal operator fun plus(other: PlotCoordsOffset) =
        PlotCoordsOffset(dPlotX + other.dPlotX, dPlotY + other.dPlotY)

    internal companion object {
        val ZERO = PlotCoordsOffset(0.0, 0.0)
    }
}
