/* Temporary helper functions to ease the transition to Kotlin. */

@file:OptIn(ExperimentalJsExport::class)
@file:Suppress("NON_EXPORTABLE_TYPE")

import content.Id
import content.IdMap

@JsExport
fun <T> idMapGet(elements: IdMap<T>, id: Id) = elements[id]
