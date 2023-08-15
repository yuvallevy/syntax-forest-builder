@file:OptIn(ExperimentalJsExport::class)

package content

/**
 * Wrapper around a set of objects that have an `id` field (all types of trees and nodes).
 * Previously a simple `Map<Id, T>` was used for fast access by ID, and objects themselves did not store their IDs.
 * IdMap internally stores this mapping but exposes a `Set`-like interface for easy iteration and JS interop.
 */
@JsExport
data class IdMap<T : WithId> internal constructor(private val items: Set<T>) {
    @JsName("of")
    constructor(vararg items: T) : this(items.toSet())
    internal constructor(items: List<T>) : this(items.toSet())

    /**
     * Objects are stored here associated with their IDs for fast access
     */
    private val internalIdMap = items.associateBy { it.id }

    internal val ids = items.map { it.id }.toSet()
    internal val size = items.size

    internal fun toTypedArray() = items.toTypedArray()

    internal operator fun contains(id: Id) = id in internalIdMap
    operator fun get(id: Id) = internalIdMap[id]
    internal operator fun minus(id: Id) = IdMap(items.filterNot { it.id == id }.toSet())
    internal operator fun plus(newItem: T) = IdMap(
        if (newItem.id in internalIdMap) items.filterNot { it.id == newItem.id }.toSet() + newItem
        else items + newItem
    )

    internal operator fun plus(newItems: Iterable<T>) = IdMap(
        items.filterNot { newItems.any { newNode -> it.id == newNode.id } }.toSet() + newItems
    )

    internal operator fun plus(newItems: Array<T>) = IdMap(
        items.filterNot { newItems.any { newNode -> it.id == newNode.id } }.toSet() + newItems
    )

    internal fun isEmpty() = items.isEmpty()
    internal fun isNotEmpty() = items.isNotEmpty()

    internal inline fun all(predicate: (T) -> Boolean) = items.all(predicate)
    internal inline fun any(predicate: (T) -> Boolean) = items.any(predicate)
    internal inline fun none(predicate: (T) -> Boolean) = items.none(predicate)

    internal inline fun filter(predicate: (T) -> Boolean) = IdMap(items.filter(predicate))
    internal inline fun <R> flatMap(transform: (T) -> Iterable<R>) = items.flatMap(transform).toTypedArray()
    fun <R> map(transform: (T) -> R) = items.map(transform).toTypedArray()
    internal inline fun <U : WithId> mapToNewIdMap(transform: (T) -> U) = IdMap(items.map(transform))
    internal inline fun <R : Comparable<R>> minOf(selector: (T) -> R) = items.minOf(selector)
}
