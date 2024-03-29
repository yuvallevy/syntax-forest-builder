@file:OptIn(ExperimentalJsExport::class)

package space.yuvalinguist.npbloom.ui

import space.yuvalinguist.npbloom.content.unpositioned.PlotCoordsOffset
import kotlin.js.ExperimentalJsExport
import kotlin.js.JsExport

typealias ZoomLevel = Double

@JsExport
data class PanZoomState(val viewPositionInPlot: PlotCoordsOffset, val zoomLevel: ZoomLevel) {
    private val allowedZoomRange = 0.1..10.0

    fun panBy(relativePanOffset: ClientCoordsOffset) =
        copy(viewPositionInPlot = viewPositionInPlot - relativePanOffset.toPlotCoordsOffset(this))

    fun zoomBy(relativeFactor: Double, focusInClient: ClientCoordsOffset): PanZoomState {
        val focusInPlot = focusInClient.toPlotCoordsOffset(this)
        val newZoomLevel = zoomLevel * relativeFactor
        if (newZoomLevel !in allowedZoomRange)
            return setZoomLevel(newZoomLevel.coerceIn(allowedZoomRange), focusInClient)
        val newViewPositionInPlot = viewPositionInPlot + focusInPlot - focusInPlot / relativeFactor
        return copy(viewPositionInPlot = newViewPositionInPlot, zoomLevel = newZoomLevel)
    }

    fun setZoomLevel(newZoomLevel: Double, focusInClient: ClientCoordsOffset): PanZoomState {
        val focusInPlot = focusInClient.toPlotCoordsOffset(this)
        val relativeFactor = newZoomLevel / zoomLevel
        val newViewPositionInPlot = viewPositionInPlot + focusInPlot - focusInPlot / relativeFactor
        return copy(viewPositionInPlot = newViewPositionInPlot, zoomLevel = newZoomLevel)
    }
}
