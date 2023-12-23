@file:OptIn(ExperimentalJsExport::class)

package space.yuvalinguist.npbloom.ui

import space.yuvalinguist.npbloom.content.positioned.CoordsInPlot
import space.yuvalinguist.npbloom.content.positioned.PositionedNode
import space.yuvalinguist.npbloom.content.positioned.PositionedTree
import kotlin.js.ExperimentalJsExport
import kotlin.js.JsExport
import kotlin.js.JsName

typealias ClientX = Double
typealias ClientY = Double
typealias DClientX = Double
typealias DClientY = Double

@JsExport
data class CoordsInClient(val clientX: ClientX, val clientY: ClientY) {
    fun toCoordsInPlot(panZoomState: PanZoomState): CoordsInPlot =
        CoordsInPlot(
            clientX / panZoomState.zoomLevel + panZoomState.panOffset.dClientX,
            clientY / panZoomState.zoomLevel + panZoomState.panOffset.dClientY
        )
}

@JsExport
data class ClientCoordsOffset(val dClientX: DClientX, val dClientY: DClientY) {
    operator fun minus(clientCoordsOffset: ClientCoordsOffset) =
        ClientCoordsOffset(dClientX - clientCoordsOffset.dClientX, dClientY - clientCoordsOffset.dClientY)
}

@JsExport
data class RectInClient(val topLeft: CoordsInClient, val bottomRight: CoordsInClient) {
    fun toRectInPlot(panZoomState: PanZoomState) =
        RectInPlot(topLeft.toCoordsInPlot(panZoomState), bottomRight.toCoordsInPlot(panZoomState))
}

@JsExport
data class RectInPlot(val topLeft: CoordsInPlot, val bottomRight: CoordsInPlot) {
    /**
     * Returns whether the given point is inside the given rectangle.
     */
    operator fun contains(coords: CoordsInPlot) =
        coords.plotX >= this.topLeft.plotX && coords.plotY >= this.topLeft.plotY &&
                coords.plotX <= this.bottomRight.plotX && coords.plotY <= this.bottomRight.plotY
}

@JsExport
@JsName("coordsInPlotToCoordsInClient")
fun CoordsInPlot.toCoordsInClient(panZoomState: PanZoomState) =
    CoordsInClient(
        (plotX - panZoomState.panOffset.dClientX) * panZoomState.zoomLevel,
        (plotY - panZoomState.panOffset.dClientY) * panZoomState.zoomLevel
    )

/**
 * Returns the center coordinate of the given node in the given tree with respect to its containing plot.
 */
@JsExport
fun calculateNodeCenterOnPlot(tree: PositionedTree, node: PositionedNode) =
    CoordsInPlot(tree.position.plotX + node.position.treeX, tree.position.plotY + node.position.treeY - 9)
