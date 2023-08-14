/* Temporary helper functions to ease the transition to Kotlin. */

@file:OptIn(ExperimentalJsExport::class)
@file:Suppress("NON_EXPORTABLE_TYPE")

import content.Id
import content.IdMap

@JsExport
fun <T> set(elements: Array<T>) = elements.toSet()

@JsExport
fun <T> arrayFromSet(elements: Set<T>) = elements.toTypedArray()

@JsExport
fun <T> idMap(elements: dynamic): IdMap<T> {
    val arrayOfArrays = js("Object.entries")(elements) as Array<Array<Any>>
    return arrayOfArrays.associate { (it[0] as Id) to (it[1] as T) }
}

@JsExport
fun <T> idMapGet(elements: IdMap<T>, id: Id) = elements[id]
