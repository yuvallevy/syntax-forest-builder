package space.yuvalinguist.npbloom.content.unpositioned

import kotlin.test.Test
import kotlin.test.assertEquals

class PlotCoordsOffsetTest {
    @Test
    fun plotCoordsOffsetAddition() = assertEquals(
        PlotCoordsOffset(5.0, 15.3),
        PlotCoordsOffset(4.0, 19.0) + PlotCoordsOffset(1.0, -3.7)
    )
}
