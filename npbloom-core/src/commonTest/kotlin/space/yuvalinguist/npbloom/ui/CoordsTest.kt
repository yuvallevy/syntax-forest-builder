package space.yuvalinguist.npbloom.ui

import space.yuvalinguist.npbloom.content.EntitySet
import space.yuvalinguist.npbloom.content.StringSlice
import space.yuvalinguist.npbloom.content.positioned.*
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertTrue

class CoordsTest {
    private val positionedPlot = PositionedPlot(
        trees = EntitySet(
            PositionedTree(
                id = "YC38BV4q",
                sentence = "Alex baked cookies.",
                nodes = EntitySet(
                    PositionedBranchingNode("kgzt", "VP", CoordsInTree(77.5, -70.0), setOf("aF3BLs", "X9M")),
                    PositionedTerminalNode("aF3BLs", "V", CoordsInTree(54.0, -2.0), StringSlice(5, 10), null),
                    PositionedTerminalNode("X9M",
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
            CoordsInClient(-32.0, 50.0).toCoordsInPlot()
        )

    @Test
    fun clientRectToPlotRect() =
        assertEquals(
            RectInPlot(CoordsInPlot(-28.0, 45.0), CoordsInPlot(-48.0, 90.0)),
            RectInClient(CoordsInClient(-28.0, 45.0), CoordsInClient(-48.0, 90.0)).toRectInPlot()
        )

    @Test
    fun plotCoordsInPlotRectTrue() =
        assertTrue(CoordsInPlot(-32.0, 50.0) in RectInPlot(CoordsInPlot(-48.0, 45.0), CoordsInPlot(-28.0, 90.0)))

    @Test
    fun plotCoordsInPlotRectFalse() =
        assertFalse(CoordsInPlot(-32.0, 40.0) in RectInPlot(CoordsInPlot(-48.0, 55.0), CoordsInPlot(-28.0, 90.0)))

    @Test
    fun coordsInPlotToCoordsInClient() =
        assertEquals(
            CoordsInClient(-32.0, 50.0),
            CoordsInPlot(-32.0, 50.0).toCoordsInClient()
        )

    @Test
    fun calculateNodeCenterOnPlot() =
        assertEquals(
            CoordsInPlot(131.0, -39.0),
            calculateNodeCenterOnPlot(positionedPlot.tree("YC38BV4q"), positionedPlot.tree("YC38BV4q").node("X9M"))
        )
}
