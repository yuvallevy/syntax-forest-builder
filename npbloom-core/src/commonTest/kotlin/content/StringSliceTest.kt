package content

import kotlin.test.Test
import kotlin.test.assertFalse
import kotlin.test.assertTrue

class StringSliceTest {
    @Test
    fun isZeroLengthTrue() = assertTrue(StringSlice(5, 5).isZeroLength)

    @Test
    fun isZeroLengthFalse() = assertFalse(StringSlice(4, 9).isZeroLength)

    @Test
    fun nonOverlappingSlices() = assertFalse(StringSlice(0, 6) overlapsWith StringSlice(8, 9))

    @Test
    fun overlappingSlices() = assertTrue(StringSlice(0, 6) overlapsWith StringSlice(4, 9))

    @Test
    fun adjacentSlices() = assertFalse(StringSlice(0, 6) overlapsWith StringSlice(6, 9))

    @Test
    fun zeroLengthSliceAtStart() = assertFalse(StringSlice(7, 9) overlapsWith StringSlice(7, 7))

    @Test
    fun zeroLengthSliceAtEnd() = assertFalse(StringSlice(7, 9) overlapsWith StringSlice(9, 9))

    @Test
    fun overlappingSlicesSameStartSmallLarge() = assertTrue(StringSlice(19, 23) overlapsWith StringSlice(19, 25))

    @Test
    fun overlappingSlicesSameStartLargeSmall() = assertTrue(StringSlice(19, 25) overlapsWith StringSlice(19, 23))

    @Test
    fun overlappingSlicesSmallFullyInsideLarge() = assertTrue(StringSlice(19, 23) overlapsWith StringSlice(16, 25))

    @Test
    fun overlappingSlicesSameEndSmallLarge() = assertTrue(StringSlice(19, 23) overlapsWith StringSlice(16, 23))

    @Test
    fun overlappingSlicesSameEndLargeSmall() = assertTrue(StringSlice(16, 23) overlapsWith StringSlice(19, 23))

    @Test
    fun crossesWordBoundaryInTrue() =
        assertTrue(StringSlice(0, 9) crossesWordBoundaryIn "Alex baked cookies.")
    
    @Test
    fun crossesWordBoundaryInFalse() =
        assertFalse(StringSlice(1, 4) crossesWordBoundaryIn "Alex baked cookies.")
}
