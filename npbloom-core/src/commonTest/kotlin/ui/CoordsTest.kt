package ui

import content.StringSlice
import content.positioned.*
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertTrue

class CoordsTest {
    private val positionedPlot = PositionedPlot(
        trees = mapOf(
            "YC38BV4q" to PositionedTree(
                sentence = "Alex baked cookies.",
                nodes = mapOf(
                    "kgzt" to PositionedBranchingNode("VP", CoordsInTree(77.5, -70.0), setOf("aF3BLs", "X9M")),
                    "aF3BLs" to PositionedTerminalNode("V", CoordsInTree(54.0, -2.0), StringSlice(5, 10), null),
                    "X9M" to PositionedTerminalNode(
                        "NP",
                        CoordsInTree(101.0, -20.0),
                        StringSlice(11, 18),
                        TreeXRange(77.0, 125.0)
                    ),
                ),
                position = CoordsInPlot(30.0, -10.0),
                width = 129.0,
            )
        )
    )

    @Test
    fun clientCoordsToPlotCoords() =
        assertEquals(
            CoordsInPlot(-32.0, 50.0),
            ClientCoords(-32.0, 50.0).toPlotCoords()
        )

    @Test
    fun clientRectToPlotRect() =
        assertEquals(
            PlotRect(CoordsInPlot(-28.0, 45.0), CoordsInPlot(-48.0, 90.0)),
            ClientRect(ClientCoords(-28.0, 45.0), ClientCoords(-48.0, 90.0)).toPlotRect()
        )

    @Test
    fun plotCoordsInPlotRectTrue() =
        assertTrue(CoordsInPlot(-32.0, 50.0) in PlotRect(CoordsInPlot(-48.0, 45.0), CoordsInPlot(-28.0, 90.0)))

    @Test
    fun plotCoordsInPlotRectFalse() =
        assertFalse(CoordsInPlot(-32.0, 40.0) in PlotRect(CoordsInPlot(-48.0, 55.0), CoordsInPlot(-28.0, 90.0)))

    @Test
    fun plotCoordsToClientCoords() =
        assertEquals(
            ClientCoords(-32.0, 50.0),
            CoordsInPlot(-32.0, 50.0).toClientCoords()
        )

    @Test
    fun calculateNodeCenterOnPlot() =
        assertEquals(
            CoordsInPlot(131.0, -39.0),
            calculateNodeCenterOnPlot(positionedPlot.tree("YC38BV4q"), positionedPlot.tree("YC38BV4q").node("X9M"))
        )
}
