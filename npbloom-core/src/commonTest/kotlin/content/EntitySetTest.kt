package content

import kotlin.math.sqrt
import kotlin.test.*

private data class SomethingWithId(
    override val id: Id,
    val someNumber: Int,
    val someWords: Set<String>,
) : WithId

class EntitySetTest {
    private val something = SomethingWithId("q50jebq2", 982, setOf("weigh"))
    private val anotherThing = SomethingWithId("soq4s", 743, setOf("autumn", "rejoice"))

    private val oneMoreThing = SomethingWithId("JDuK06OV", 631, setOf("modesty", "flour"))
    private val yetAnotherThing = SomethingWithId("J3nG", 671, setOf("hammer"))

    private val entitySet = EntitySet(something, anotherThing)

    @Test
    fun ids() = assertEquals(setOf("q50jebq2", "soq4s"), entitySet.ids)

    @Test
    fun size() = assertEquals(2, entitySet.size)

    @Test
    fun containsTrue() = assertTrue("soq4s" in entitySet)

    @Test
    fun containsFalse() = assertFalse("4Bgzl98b" in entitySet)

    @Test
    fun get() = assertEquals(something, entitySet["q50jebq2"])

    @Test
    fun minus() = assertEquals(EntitySet(anotherThing), entitySet - something.id)

    @Test
    fun plusSingle() =
        assertEquals(
            EntitySet(something, anotherThing, oneMoreThing),
            entitySet + oneMoreThing
        )

    @Test
    fun plusIterable() =
        assertEquals(
            EntitySet(something, anotherThing, oneMoreThing, yetAnotherThing),
            entitySet + setOf(yetAnotherThing, oneMoreThing)
        )

    @Test
    fun plusArray() =
        assertEquals(
            EntitySet(something, anotherThing, oneMoreThing, yetAnotherThing),
            entitySet + arrayOf(yetAnotherThing, oneMoreThing)
        )

    @Test
    fun isEmptyTrue() = assertTrue(EntitySet<SomethingWithId>().isEmpty())

    @Test
    fun isEmptyFalse() = assertFalse(entitySet.isEmpty())

    @Test
    fun isNotEmptyTrue() = assertTrue(entitySet.isNotEmpty())

    @Test
    fun isNotEmptyFalse() = assertFalse(EntitySet<SomethingWithId>().isNotEmpty())

    @Test
    fun allTrue() = assertTrue(entitySet.all { it.someNumber > 700 })

    @Test
    fun allFalse() = assertFalse(entitySet.all { it.someWords.size == 3 })

    @Test
    fun anyTrue() = assertTrue(entitySet.any { it.someWords.size == 2 })

    @Test
    fun anyFalse() = assertFalse(entitySet.any { it.someNumber < 700 })

    @Test
    fun noneTrue() = assertTrue(entitySet.none { it.someNumber > 800 && it.someWords.size == 2 })

    @Test
    fun noneFalse() = assertFalse(entitySet.none { it.someNumber > 800 || it.someWords.size == 2 })

    @Test
    fun filterAll() = assertEquals(EntitySet(something, anotherThing), entitySet.filter { it.someWords.size <= 2 })

    @Test
    fun filterSome() = assertEquals(EntitySet(something), entitySet.filter { it.someNumber > 800 })

    @Test
    fun filterNone() = assertEquals(EntitySet(), entitySet.filter { it.someWords.isEmpty() })

    @Test
    fun flatMap() = assertEquals(listOf("weigh", "autumn", "rejoice"), entitySet.flatMap { it.someWords })

    @Test
    fun map() = assertEquals(listOf(31, 27), entitySet.map { sqrt(it.someNumber.toDouble()).toInt() })

    @Test
    fun mapToNewEntitySet() = assertEquals(
        EntitySet(
            SomethingWithId("q50jebq2", 42, setOf("hgiew")),
            SomethingWithId("soq4s", 281, setOf("nmutua", "eciojer")),
        ),
        entitySet.mapToNewEntitySet {
            it.copy(someNumber = 1024 - it.someNumber, someWords = it.someWords.map(String::reversed).toSet())
        }
    )
}
