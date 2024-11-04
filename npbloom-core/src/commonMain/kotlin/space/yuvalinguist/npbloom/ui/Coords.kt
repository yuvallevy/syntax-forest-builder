@file:OptIn(ExperimentalJsExport::class)

package space.yuvalinguist.npbloom.ui

import space.yuvalinguist.npbloom.content.positioned.CoordsInPlot
import space.yuvalinguist.npbloom.content.positioned.CoordsInTree
import space.yuvalinguist.npbloom.content.positioned.PositionedNode
import space.yuvalinguist.npbloom.content.positioned.PositionedTree
import space.yuvalinguist.npbloom.content.unpositioned.PlotCoordsOffset
import kotlin.js.ExperimentalJsExport
import kotlin.js.JsExport
import kotlin.js.JsName

typealias ClientX = Double
typealias ClientY = Double
typealias DClientX = Double
typealias DClientY = Double

@JsExport
data class CoordsInClient(val clientX: ClientX, val clientY: ClientY) {
    internal operator fun plus(clientCoordsOffset: ClientCoordsOffset) =
        CoordsInClient(clientX + clientCoordsOffset.dClientX, clientY + clientCoordsOffset.dClientY)

    internal operator fun minus(clientCoordsOffset: ClientCoordsOffset) =
        CoordsInClient(clientX - clientCoordsOffset.dClientX, clientY - clientCoordsOffset.dClientY)

    fun toCoordsInPlot(panZoomState: PanZoomState): CoordsInPlot =
        CoordsInPlot(
            clientX / panZoomState.zoomLevel + panZoomState.viewPositionInPlot.dPlotX,
            clientY / panZoomState.zoomLevel + panZoomState.viewPositionInPlot.dPlotY
        )

    fun toOffset() = ClientCoordsOffset(clientX, clientY)
}

@JsExport
data class ClientCoordsOffset(val dClientX: DClientX, val dClientY: DClientY) {
    operator fun plus(clientCoordsOffset: ClientCoordsOffset) =
        ClientCoordsOffset(dClientX + clientCoordsOffset.dClientX, dClientY + clientCoordsOffset.dClientY)

    operator fun minus(clientCoordsOffset: ClientCoordsOffset) =
        ClientCoordsOffset(dClientX - clientCoordsOffset.dClientX, dClientY - clientCoordsOffset.dClientY)

    operator fun times(factor: Double) =
        ClientCoordsOffset(dClientX * factor, dClientY * factor)

    operator fun div(factor: Double) =
        ClientCoordsOffset(dClientX / factor, dClientY / factor)

    fun toPlotCoordsOffset(panZoomState: PanZoomState) =
        PlotCoordsOffset(dClientX / panZoomState.zoomLevel, dClientY / panZoomState.zoomLevel)
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
        (plotX - panZoomState.viewPositionInPlot.dPlotX) * panZoomState.zoomLevel,
        (plotY - panZoomState.viewPositionInPlot.dPlotY) * panZoomState.zoomLevel
    )

@JsExport
@JsName("plotCoordsOffsetToClientCoordsOffset")
fun PlotCoordsOffset.toClientCoordsOffset(panZoomState: PanZoomState) =
    ClientCoordsOffset(dPlotX * panZoomState.zoomLevel, dPlotY * panZoomState.zoomLevel)

private const val NODE_BOTTOM_TO_CENTER_DISTANCE = 9

/**
 * Returns the center coordinate of the given node in the given tree with respect to its containing tree.
 */
@JsExport
fun calculateNodeCenterInTree(node: PositionedNode) =
    CoordsInTree(node.position.treeX, node.position.treeY - NODE_BOTTOM_TO_CENTER_DISTANCE)

/**
 * Returns the center coordinate of the given node in the given tree with respect to its containing plot.
 */
@JsExport
fun calculateNodeCenterOnPlot(tree: PositionedTree, node: PositionedNode) =
    CoordsInPlot(tree.position.plotX + node.position.treeX,
        tree.position.plotY + node.position.treeY - NODE_BOTTOM_TO_CENTER_DISTANCE)
