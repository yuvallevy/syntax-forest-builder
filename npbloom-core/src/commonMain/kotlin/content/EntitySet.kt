@file:OptIn(ExperimentalJsExport::class)

package content

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlin.js.ExperimentalJsExport
import kotlin.js.JsExport
import kotlin.js.JsName

/**
 * Wrapper around a set of objects that have an `id` field (all types of trees and nodes).
 * Previously a simple `Map<Id, T>` was used for fast access by ID, and objects themselves did not store their IDs.
 * EntitySet internally stores this mapping but exposes a `Set`-like interface for easy iteration and JS interop.
 */
@JsExport
@Serializable
data class EntitySet<T : WithId> internal constructor(
    @SerialName("e") private val entities: Set<T>
) {
    @JsName("of")
    constructor(vararg items: T) : this(items.toSet())
    internal constructor(items: List<T>) : this(items.toSet())

    /**
     * Objects are stored here associated with their IDs for fast access
     */
    private val internalIdMap = entities.associateBy { it.id }

    internal val ids = entities.map { it.id }.toSet()
    internal val size = entities.size

    internal fun toTypedArray() = entities.toTypedArray()

    internal operator fun contains(id: Id) = id in internalIdMap
    operator fun get(id: Id) = internalIdMap[id]
    internal operator fun minus(id: Id) = EntitySet(entities.filterNot { it.id == id }.toSet())
    internal operator fun plus(newItem: T) = EntitySet(
        if (newItem.id in internalIdMap) entities.filterNot { it.id == newItem.id }.toSet() + newItem
        else entities + newItem
    )

    internal operator fun plus(newItems: Iterable<T>) = EntitySet(
        entities.filterNot { newItems.any { newNode -> it.id == newNode.id } }.toSet() + newItems
    )

    internal operator fun plus(newItems: Array<T>) = EntitySet(
        entities.filterNot { newItems.any { newNode -> it.id == newNode.id } }.toSet() + newItems
    )

    internal fun isEmpty() = entities.isEmpty()
    internal fun isNotEmpty() = entities.isNotEmpty()

    internal inline fun all(predicate: (T) -> Boolean) = entities.all(predicate)
    internal inline fun any(predicate: (T) -> Boolean) = entities.any(predicate)
    internal inline fun none(predicate: (T) -> Boolean) = entities.none(predicate)

    internal inline fun filter(predicate: (T) -> Boolean) = EntitySet(entities.filter(predicate))
    internal inline fun find(predicate: (T) -> Boolean) = entities.find(predicate)
    internal inline fun <R> flatMap(transform: (T) -> Iterable<R>) = entities.flatMap(transform).toTypedArray()
    fun <R> map(transform: (T) -> R) = entities.map(transform).toTypedArray()
    internal inline fun <U : WithId> mapToNewEntitySet(transform: (T) -> U) = EntitySet(entities.map(transform))
    internal inline fun <R : Comparable<R>> minOf(selector: (T) -> R) = entities.minOf(selector)
}
