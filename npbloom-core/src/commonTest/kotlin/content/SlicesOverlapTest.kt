package content

import kotlin.test.Test
import kotlin.test.assertFalse
import kotlin.test.assertTrue

class SlicesOverlapTest {
    @Test
    fun nonOverlappingSlices() = assertFalse(slicesOverlap(StringSlice(0, 6), StringSlice(8, 9)))

    @Test
    fun overlappingSlices() = assertTrue(slicesOverlap(StringSlice(0, 6), StringSlice(4, 9)))

    @Test
    fun adjacentSlices() = assertFalse(slicesOverlap(StringSlice(0, 6), StringSlice(6, 9)))

    @Test
    fun zeroLengthSliceAtStart() = assertFalse(slicesOverlap(StringSlice(7, 9), StringSlice(7, 7)))

    @Test
    fun zeroLengthSliceAtEnd() = assertFalse(slicesOverlap(StringSlice(7, 9), StringSlice(9, 9)))

    @Test
    fun overlappingSlicesSameStartSmallLarge() = assertTrue(slicesOverlap(StringSlice(19, 23), StringSlice(19, 25)))

    @Test
    fun overlappingSlicesSameStartLargeSmall() = assertTrue(slicesOverlap(StringSlice(19, 25), StringSlice(19, 23)))

    @Test
    fun overlappingSlicesSmallFullyInsideLarge() = assertTrue(slicesOverlap(StringSlice(19, 23), StringSlice(16, 25)))

    @Test
    fun overlappingSlicesSameEndSmallLarge() = assertTrue(slicesOverlap(StringSlice(19, 23), StringSlice(16, 23)))

    @Test
    fun overlappingSlicesSameEndLargeSmall() = assertTrue(slicesOverlap(StringSlice(16, 23), StringSlice(19, 23)))
}
