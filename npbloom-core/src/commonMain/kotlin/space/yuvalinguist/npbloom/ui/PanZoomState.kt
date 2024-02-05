@file:OptIn(ExperimentalJsExport::class)

package space.yuvalinguist.npbloom.ui

import space.yuvalinguist.npbloom.content.unpositioned.PlotCoordsOffset
import kotlin.js.ExperimentalJsExport
import kotlin.js.JsExport

typealias ZoomLevel = Double

@JsExport
data class PanZoomState(val viewPositionInPlot: PlotCoordsOffset, val zoomLevel: ZoomLevel) {
    fun panBy(relativePanOffset: ClientCoordsOffset) =
        copy(viewPositionInPlot = viewPositionInPlot - relativePanOffset.toPlotCoordsOffset(this))

    fun zoom(relativeFactor: Double, focusInClient: ClientCoordsOffset): PanZoomState {
        val focusInPlot = focusInClient.toPlotCoordsOffset(this)
        val newZoomLevel = zoomLevel * relativeFactor
        val newViewPositionInPlot = viewPositionInPlot + focusInPlot - focusInPlot / relativeFactor
        return copy(viewPositionInPlot = newViewPositionInPlot, zoomLevel = newZoomLevel)
    }
}
