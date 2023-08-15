import kotlin.test.Test
import kotlin.test.assertContentEquals

class EditArrayAtTest {
    @Test
    fun testInsertInMiddle() =
        assertContentEquals(
            arrayOf("parsley", "sage", "rosemary", "thyme"),
            arrayOf("parsley", "sage", "thyme").insertAt(2, "rosemary")
        )

    @Test
    fun testInsertAtStart() =
        assertContentEquals(
            arrayOf("parsley", "sage", "rosemary", "thyme"),
            arrayOf("sage", "rosemary", "thyme").insertAt(0, "parsley")
        )

    @Test
    fun testInsertAtEnd() =
        assertContentEquals(
            arrayOf("parsley", "sage", "rosemary", "thyme"),
            arrayOf("parsley", "sage", "rosemary").insertAt(3, "thyme")
        )

    @Test
    fun testInsertAfterEnd() =
        assertContentEquals(
            arrayOf("parsley", "sage", "rosemary", "thyme"),
            arrayOf("parsley", "sage", "rosemary").insertAt(3, "thyme")
        )

    @Test
    fun testChangeInMiddle() =
        assertContentEquals(
            arrayOf("parsley", "rosemary", "thyme"),
            arrayOf("parsley", "sage", "thyme").changeAt(1, "rosemary")
        )

    @Test
    fun testChangeAtStart() =
        assertContentEquals(
            arrayOf("parsley", "rosemary", "thyme"),
            arrayOf("sage", "rosemary", "thyme").changeAt(0, "parsley")
        )

    @Test
    fun testChangeAtEnd() =
        assertContentEquals(
            arrayOf("parsley", "sage", "rosemary"),
            arrayOf("parsley", "sage", "thyme").changeAt(2, "rosemary")
        )

    @Test
    fun testChangeAfterEnd() =
        assertContentEquals(
            arrayOf("parsley", "sage", "rosemary", "thyme"),
            arrayOf("parsley", "sage", "rosemary").changeAt(3, "thyme")
        )

    @Test
    fun testRemoveInMiddle() =
        assertContentEquals(
            arrayOf("parsley", "rosemary", "thyme"),
            arrayOf("parsley", "sage", "rosemary", "thyme").removeAt(1)
        )

    @Test
    fun testRemoveAtStart() =
        assertContentEquals(
            arrayOf("sage", "rosemary", "thyme"),
            arrayOf("parsley", "sage", "rosemary", "thyme").removeAt(0)
        )

    @Test
    fun testRemoveAtEnd() =
        assertContentEquals(
            arrayOf("parsley", "sage", "rosemary"),
            arrayOf("parsley", "sage", "rosemary", "thyme").removeAt(3)
        )

    @Test
    fun testRemoveAfterEnd() =
        assertContentEquals(
            arrayOf("parsley", "sage", "rosemary", "thyme"),
            arrayOf("parsley", "sage", "rosemary", "thyme").removeAt(4)
        )
}