@file:OptIn(ExperimentalJsExport::class)

package space.yuvalinguist.npbloom.content

import kotlin.js.ExperimentalJsExport
import kotlin.js.JsExport

typealias Sentence = String

@JsExport
interface TreeBase : WithId {
    val sentence: Sentence
}
