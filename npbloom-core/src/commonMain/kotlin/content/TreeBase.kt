@file:OptIn(ExperimentalJsExport::class)

package content

typealias Sentence = String

@JsExport
interface TreeBase : WithId {
    val sentence: Sentence
}
