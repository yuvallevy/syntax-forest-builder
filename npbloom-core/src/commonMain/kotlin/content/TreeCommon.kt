@file:OptIn(ExperimentalJsExport::class)

package content

typealias Sentence = String

@JsExport
interface TreeCommon {
    val sentence: Sentence
}
