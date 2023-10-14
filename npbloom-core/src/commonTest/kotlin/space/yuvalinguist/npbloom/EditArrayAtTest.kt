import space.yuvalinguist.npbloom.changeAt
import space.yuvalinguist.npbloom.insertAt
import space.yuvalinguist.npbloom.removeAt
import kotlin.test.Test
import kotlin.test.assertContentEquals

class EditArrayAtTest {
    @Test
    fun testInsertInMiddle() =
        assertContentEquals(
            listOf("parsley", "sage", "rosemary", "thyme"),
            listOf("parsley", "sage", "thyme").insertAt(2, "rosemary")
        )

    @Test
    fun testInsertAtStart() =
        assertContentEquals(
            listOf("parsley", "sage", "rosemary", "thyme"),
            listOf("sage", "rosemary", "thyme").insertAt(0, "parsley")
        )

    @Test
    fun testInsertAtEnd() =
        assertContentEquals(
            listOf("parsley", "sage", "rosemary", "thyme"),
            listOf("parsley", "sage", "rosemary").insertAt(3, "thyme")
        )

    @Test
    fun testInsertAfterEnd() =
        assertContentEquals(
            listOf("parsley", "sage", "rosemary", "thyme"),
            listOf("parsley", "sage", "rosemary").insertAt(3, "thyme")
        )

    @Test
    fun testChangeInMiddle() =
        assertContentEquals(
            listOf("parsley", "rosemary", "thyme"),
            listOf("parsley", "sage", "thyme").changeAt(1, "rosemary")
        )

    @Test
    fun testChangeAtStart() =
        assertContentEquals(
            listOf("parsley", "rosemary", "thyme"),
            listOf("sage", "rosemary", "thyme").changeAt(0, "parsley")
        )

    @Test
    fun testChangeAtEnd() =
        assertContentEquals(
            listOf("parsley", "sage", "rosemary"),
            listOf("parsley", "sage", "thyme").changeAt(2, "rosemary")
        )

    @Test
    fun testChangeAfterEnd() =
        assertContentEquals(
            listOf("parsley", "sage", "rosemary", "thyme"),
            listOf("parsley", "sage", "rosemary").changeAt(3, "thyme")
        )

    @Test
    fun testRemoveInMiddle() =
        assertContentEquals(
            listOf("parsley", "rosemary", "thyme"),
            listOf("parsley", "sage", "rosemary", "thyme").removeAt(1)
        )

    @Test
    fun testRemoveAtStart() =
        assertContentEquals(
            listOf("sage", "rosemary", "thyme"),
            listOf("parsley", "sage", "rosemary", "thyme").removeAt(0)
        )

    @Test
    fun testRemoveAtEnd() =
        assertContentEquals(
            listOf("parsley", "sage", "rosemary"),
            listOf("parsley", "sage", "rosemary", "thyme").removeAt(3)
        )

    @Test
    fun testRemoveAfterEnd() =
        assertContentEquals(
            listOf("parsley", "sage", "rosemary", "thyme"),
            listOf("parsley", "sage", "rosemary", "thyme").removeAt(4)
        )
}