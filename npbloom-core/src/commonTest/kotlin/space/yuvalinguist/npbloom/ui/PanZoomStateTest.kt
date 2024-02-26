package space.yuvalinguist.npbloom.ui

import space.yuvalinguist.npbloom.content.unpositioned.PlotCoordsOffset
import kotlin.test.Test
import kotlin.test.assertEquals

class PanZoomStateTest {
    private val originInPlot = PlotCoordsOffset(0.0, 0.0)
    private val originInClient = ClientCoordsOffset(0.0, 0.0)
    private val initialPanZoomState = PanZoomState(originInPlot, 1.0)

    @Test
    fun panFromOriginAtZoom100() {
        val newPanZoomState = initialPanZoomState.panBy(ClientCoordsOffset(10.0, 20.0))
        assertEquals(PlotCoordsOffset(-10.0, -20.0), newPanZoomState.viewPositionInPlot)
    }

    @Test
    fun panFromArbitraryAtZoom100() {
        val panZoomState = PanZoomState(PlotCoordsOffset(10.0, 20.0), 1.0)
        val newPanZoomState = panZoomState.panBy(ClientCoordsOffset(7.0, 5.0))
        assertEquals(PlotCoordsOffset(3.0, 15.0), newPanZoomState.viewPositionInPlot)
    }

    @Test
    fun panFromOriginAtZoom200() {
        val newPanZoomState = initialPanZoomState.copy(zoomLevel = 2.0).panBy(ClientCoordsOffset(20.0, 40.0))
        assertEquals(PlotCoordsOffset(-10.0, -20.0), newPanZoomState.viewPositionInPlot)
    }

    @Test
    fun zoomInFrom100FocusedOnOrigin() {
        val newPanZoomState = initialPanZoomState.zoomBy(2.0, originInClient)
        assertEquals(2.0, newPanZoomState.zoomLevel)
        assertEquals(originInPlot, newPanZoomState.viewPositionInPlot)
    }

    @Test
    fun zoomInFrom200FocusedOnOrigin() {
        val panZoomState = PanZoomState(originInPlot, 2.0)
        val newPanZoomState = panZoomState.zoomBy(2.0, originInClient)
        assertEquals(4.0, newPanZoomState.zoomLevel)
        assertEquals(originInPlot, newPanZoomState.viewPositionInPlot)
    }

    @Test
    fun zoomInFrom100FocusedOnArbitrary() {
        val focusInClient = ClientCoordsOffset(2.0, 1.0)
        val panZoomState = PanZoomState(originInPlot, 1.0)
        val relativeZoomFactor = 4.0 / 3.0
        val newPanZoomState = panZoomState.zoomBy(relativeZoomFactor, focusInClient)
        assertEquals(relativeZoomFactor, newPanZoomState.zoomLevel)
        assertEquals(PlotCoordsOffset(0.5, 0.25), newPanZoomState.viewPositionInPlot)
    }

    @Test
    fun zoomInFrom100AfterPanFocusedOnArbitrary() {
        val focusInClient = ClientCoordsOffset(2.0, 1.0)
        val panZoomState = PanZoomState(PlotCoordsOffset(1.0, 3.0), 1.0)
        val relativeZoomFactor = 4.0 / 3.0
        val newPanZoomState = panZoomState.zoomBy(relativeZoomFactor, focusInClient)
        assertEquals(relativeZoomFactor, newPanZoomState.zoomLevel)
        assertEquals(PlotCoordsOffset(1.5, 3.25), newPanZoomState.viewPositionInPlot)
    }

    @Test
    fun setZoomLevelFocusedOnOrigin() {
        val newPanZoomState = initialPanZoomState.setZoomLevel(2.0, originInClient)
        assertEquals(2.0, newPanZoomState.zoomLevel)
        assertEquals(originInPlot, newPanZoomState.viewPositionInPlot)
    }

    @Test
    fun setZoomLevelFocusedOnArbitrary() {
        val focusInClient = ClientCoordsOffset(2.0, 1.0)
        val panZoomState = PanZoomState(originInPlot, 1.0)
        val newPanZoomState = panZoomState.setZoomLevel(4.0, focusInClient)
        assertEquals(4.0, newPanZoomState.zoomLevel)
        assertEquals(PlotCoordsOffset(1.5, 0.75), newPanZoomState.viewPositionInPlot)
    }
}
