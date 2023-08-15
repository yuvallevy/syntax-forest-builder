package content.unpositioned

import kotlin.test.Test
import kotlin.test.assertEquals

class TreeCoordsOffsetTest {
    @Test
    fun treeCoordsOffsetAddition() = assertEquals(
        TreeCoordsOffset(5.0, 15.3),
        TreeCoordsOffset(4.0, 19.0) + TreeCoordsOffset(1.0, -3.7)
    )
}
