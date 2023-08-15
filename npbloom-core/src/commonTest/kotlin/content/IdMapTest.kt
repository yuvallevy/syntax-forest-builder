package content

import kotlin.math.sqrt
import kotlin.test.*

private data class SomethingWithId(
    override val id: Id,
    val someNumber: Int,
    val someWords: Set<String>,
) : WithId

class IdMapTest {
    private val something = SomethingWithId("q50jebq2", 982, setOf("weigh"))
    private val anotherThing = SomethingWithId("soq4s", 743, setOf("autumn", "rejoice"))

    private val oneMoreThing = SomethingWithId("JDuK06OV", 631, setOf("modesty", "flour"))
    private val yetAnotherThing = SomethingWithId("J3nG", 671, setOf("hammer"))

    private val idMap = IdMap(something, anotherThing)

    @Test
    fun ids() = assertEquals(setOf("q50jebq2", "soq4s"), idMap.ids)

    @Test
    fun size() = assertEquals(2, idMap.size)

    @Test
    fun toTypedArray() =
        assertContentEquals(arrayOf(something, anotherThing), idMap.toTypedArray())

    @Test
    fun containsTrue() = assertTrue("soq4s" in idMap)

    @Test
    fun containsFalse() = assertFalse("4Bgzl98b" in idMap)

    @Test
    fun get() = assertEquals(something, idMap["q50jebq2"])

    @Test
    fun minus() = assertEquals(IdMap(anotherThing), idMap - something.id)

    @Test
    fun plusSingle() =
        assertEquals(
            IdMap(something, anotherThing, oneMoreThing),
            idMap + oneMoreThing
        )

    @Test
    fun plusIterable() =
        assertEquals(
            IdMap(something, anotherThing, oneMoreThing, yetAnotherThing),
            idMap + setOf(yetAnotherThing, oneMoreThing)
        )

    @Test
    fun plusArray() =
        assertEquals(
            IdMap(something, anotherThing, oneMoreThing, yetAnotherThing),
            idMap + arrayOf(yetAnotherThing, oneMoreThing)
        )

    @Test
    fun isEmptyTrue() = assertTrue(IdMap<SomethingWithId>().isEmpty())

    @Test
    fun isEmptyFalse() = assertFalse(idMap.isEmpty())

    @Test
    fun isNotEmptyTrue() = assertTrue(idMap.isNotEmpty())

    @Test
    fun isNotEmptyFalse() = assertFalse(IdMap<SomethingWithId>().isNotEmpty())

    @Test
    fun allTrue() = assertTrue(idMap.all { it.someNumber > 700 })

    @Test
    fun allFalse() = assertFalse(idMap.all { it.someWords.size == 3 })

    @Test
    fun anyTrue() = assertTrue(idMap.any { it.someWords.size == 2 })

    @Test
    fun anyFalse() = assertFalse(idMap.any { it.someNumber < 700 })

    @Test
    fun noneTrue() = assertTrue(idMap.none { it.someNumber > 800 && it.someWords.size == 2 })

    @Test
    fun noneFalse() = assertFalse(idMap.none { it.someNumber > 800 || it.someWords.size == 2 })

    @Test
    fun filterAll() = assertEquals(IdMap(something, anotherThing), idMap.filter { it.someWords.size <= 2 })

    @Test
    fun filterSome() = assertEquals(IdMap(something), idMap.filter { it.someNumber > 800 })

    @Test
    fun filterNone() = assertEquals(IdMap(), idMap.filter { it.someWords.isEmpty() })

    @Test
    fun flatMap() = assertContentEquals(arrayOf("weigh", "autumn", "rejoice"), idMap.flatMap { it.someWords })

    @Test
    fun map() = assertContentEquals(arrayOf(31, 27), idMap.map { sqrt(it.someNumber.toDouble()).toInt() })

    @Test
    fun mapToNewIdMap() = assertEquals(
        IdMap(
            SomethingWithId("q50jebq2", 42, setOf("hgiew")),
            SomethingWithId("soq4s", 281, setOf("nmutua", "eciojer")),
        ),
        idMap.mapToNewIdMap { it.copy(
            someNumber = 1024 - it.someNumber,
            someWords = it.someWords.map(String::reversed).toSet(),
        ) }
    )
}
