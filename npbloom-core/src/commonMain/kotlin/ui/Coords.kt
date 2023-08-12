package ui

import content.positioned.CoordsInPlot
import content.positioned.PositionedNode
import content.positioned.PositionedTree

typealias ClientX = Double
typealias ClientY = Double
typealias DClientX = Double
typealias DClientY = Double

// Calculate plot coords from client coords & vice versa, when they're different (when zoom and/or pan are implemented)

data class ClientCoords(val clientX: ClientX, val clientY: ClientY) {
    fun toPlotCoords() = CoordsInPlot(clientX, clientY)
}

data class ClientCoordsOffset(val dClientX: DClientX, val dClientY: DClientY)

data class ClientRect(val topLeft: ClientCoords, val bottomRight: ClientCoords) {
    fun toPlotRect() = PlotRect(topLeft.toPlotCoords(), bottomRight.toPlotCoords())
}

data class PlotRect(val topLeft: CoordsInPlot, val bottomRight: CoordsInPlot) {
    /**
     * Returns whether the given point is inside the given rectangle.
     */
    operator fun contains(coords: CoordsInPlot) =
        coords.plotX >= this.topLeft.plotX && coords.plotY >= this.topLeft.plotY &&
                coords.plotX <= this.bottomRight.plotX && coords.plotY <= this.bottomRight.plotY
}

fun CoordsInPlot.toClientCoords() = ClientCoords(plotX, plotY)

/**
 * Returns the center coordinate of the given node in the given tree with respect to its containing plot.
 */
fun calculateNodeCenterOnPlot(tree: PositionedTree, node: PositionedNode) =
    CoordsInPlot(tree.position.plotX + node.position.treeX, tree.position.plotY + node.position.treeY - 9)
