package space.yuvalinguist.npbloom.ui

import space.yuvalinguist.npbloom.content.EntitySet
import space.yuvalinguist.npbloom.content.StringSlice
import space.yuvalinguist.npbloom.content.positioned.*
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertTrue

class CoordsTest {
    private val defaultPanZoomState = PanZoomState(ClientCoordsOffset(0.0, 0.0), 1.0)
    private val panZoomStateWithPan = defaultPanZoomState.copy(panOffset = ClientCoordsOffset(9.1, -44.0))
    private val panZoomStateWithZoom = defaultPanZoomState.copy(zoomLevel = 2.5)
    private val panZoomStateWithBoth = PanZoomState(ClientCoordsOffset(-6.0, 10.5), 0.5)

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
    fun clientCoordsToPlotCoordsAtDefaultPanZoom() {
        assertEquals(
            CoordsInPlot(-32.0, 50.0),
            CoordsInClient(-32.0, 50.0).toCoordsInPlot(defaultPanZoomState)
        )
    }

    @Test
    fun clientCoordsToPlotCoordsPanned() {
        assertEquals(
            CoordsInPlot(-22.9, 6.0),
            CoordsInClient(-32.0, 50.0).toCoordsInPlot(panZoomStateWithPan)
        )
    }

    @Test
    fun clientCoordsToPlotCoordsZoomed() {
        assertEquals(
            CoordsInPlot(-12.8, 20.0),
            CoordsInClient(-32.0, 50.0).toCoordsInPlot(panZoomStateWithZoom)
        )
    }

    @Test
    fun clientCoordsToPlotCoordsPannedAndZoomed() {
        assertEquals(
            CoordsInPlot(-70.0, 110.5),
            CoordsInClient(-32.0, 50.0).toCoordsInPlot(panZoomStateWithBoth)
        )
    }

    @Test
    fun clientRectToPlotRectAtDefaultPanZoom() =
        assertEquals(
            RectInPlot(CoordsInPlot(-28.0, 45.0), CoordsInPlot(-48.0, 90.0)),
            RectInClient(CoordsInClient(-28.0, 45.0), CoordsInClient(-48.0, 90.0))
                .toRectInPlot(defaultPanZoomState)
        )

    @Test
    fun clientRectToPlotRectPanned() =
        assertEquals(
            RectInPlot(CoordsInPlot(-18.9, 1.0), CoordsInPlot(-38.9, 46.0)),
            RectInClient(CoordsInClient(-28.0, 45.0), CoordsInClient(-48.0, 90.0))
                .toRectInPlot(panZoomStateWithPan)
        )

    @Test
    fun clientRectToPlotRectZoomed() =
        assertEquals(
            RectInPlot(CoordsInPlot(-11.2, 18.0), CoordsInPlot(-19.2, 36.0)),
            RectInClient(CoordsInClient(-28.0, 45.0), CoordsInClient(-48.0, 90.0))
                .toRectInPlot(panZoomStateWithZoom)
        )

    @Test
    fun clientRectToPlotRectPannedAndZoomed() =
        assertEquals(
            RectInPlot(CoordsInPlot(-62.0, 100.5), CoordsInPlot(-102.0, 190.5)),
            RectInClient(CoordsInClient(-28.0, 45.0), CoordsInClient(-48.0, 90.0))
                .toRectInPlot(panZoomStateWithBoth)
        )

    @Test
    fun plotCoordsInPlotRectTrue() =
        assertTrue(CoordsInPlot(-32.0, 50.0) in RectInPlot(CoordsInPlot(-48.0, 45.0), CoordsInPlot(-28.0, 90.0)))

    @Test
    fun plotCoordsInPlotRectFalse() =
        assertFalse(CoordsInPlot(-32.0, 40.0) in RectInPlot(CoordsInPlot(-48.0, 55.0), CoordsInPlot(-28.0, 90.0)))

    @Test
    fun coordsInPlotToCoordsInClientAtDefaultPanZoom() =
        assertEquals(
            CoordsInClient(-32.0, 50.0),
            CoordsInPlot(-32.0, 50.0).toCoordsInClient(defaultPanZoomState)
        )

    @Test
    fun coordsInPlotToCoordsInClientPanned() =
        assertEquals(
            CoordsInClient(-41.1, 94.0),
            CoordsInPlot(-32.0, 50.0).toCoordsInClient(panZoomStateWithPan)
        )

    @Test
    fun coordsInPlotToCoordsInClientZoomed() =
        assertEquals(
            CoordsInClient(-80.0, 125.0),
            CoordsInPlot(-32.0, 50.0).toCoordsInClient(panZoomStateWithZoom)
        )

    @Test
    fun coordsInPlotToCoordsInClientPannedAndZoomed() =
        assertEquals(
            CoordsInClient(-13.0, 19.75),
            CoordsInPlot(-32.0, 50.0).toCoordsInClient(panZoomStateWithBoth)
        )

    @Test
    fun calculateNodeCenterOnPlot() =
        assertEquals(
            CoordsInPlot(131.0, -39.0),
            calculateNodeCenterOnPlot(positionedPlot.tree("YC38BV4q"), positionedPlot.tree("YC38BV4q").node("X9M"))
        )
}
