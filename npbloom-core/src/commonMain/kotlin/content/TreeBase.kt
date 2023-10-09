@file:OptIn(ExperimentalJsExport::class)

package content

import kotlin.js.ExperimentalJsExport
import kotlin.js.JsExport

typealias Sentence = String

@JsExport
interface TreeBase : WithId {
    val sentence: Sentence
}
