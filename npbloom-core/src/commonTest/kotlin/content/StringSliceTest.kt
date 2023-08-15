package content

import kotlin.test.Test
import kotlin.test.assertFalse
import kotlin.test.assertTrue

class StringSliceTest {
    @Test
    fun isZeroLengthTrue() = assertTrue(StringSlice(5, 5).isZeroLength)

    @Test
    fun isZeroLengthFalse() = assertFalse(StringSlice(4, 9).isZeroLength)
}
