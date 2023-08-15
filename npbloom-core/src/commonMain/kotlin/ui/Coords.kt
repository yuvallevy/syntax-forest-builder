@file:OptIn(ExperimentalJsExport::class)

package ui

import content.positioned.CoordsInPlot
import content.positioned.PositionedNode
import content.positioned.PositionedTree

typealias ClientX = Double
typealias ClientY = Double
typealias DClientX = Double
typealias DClientY = Double

// Calculate plot coords from client coords & vice versa, when they're different (when zoom and/or pan are implemented)

@JsExport
data class CoordsInClient(val clientX: ClientX, val clientY: ClientY) {
    fun toCoordsInPlot() = CoordsInPlot(clientX, clientY)
}

@JsExport
data class ClientCoordsOffset(val dClientX: DClientX, val dClientY: DClientY)

@JsExport
data class RectInClient(val topLeft: CoordsInClient, val bottomRight: CoordsInClient) {
    fun toRectInPlot() = RectInPlot(topLeft.toCoordsInPlot(), bottomRight.toCoordsInPlot())
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
fun CoordsInPlot.toCoordsInClient() = CoordsInClient(plotX, plotY)

/**
 * Returns the center coordinate of the given node in the given tree with respect to its containing plot.
 */
@JsExport
fun calculateNodeCenterOnPlot(tree: PositionedTree, node: PositionedNode) =
    CoordsInPlot(tree.position.plotX + node.position.treeX, tree.position.plotY + node.position.treeY - 9)
