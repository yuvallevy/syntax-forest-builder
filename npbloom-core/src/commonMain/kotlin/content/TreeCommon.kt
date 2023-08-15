@file:OptIn(ExperimentalJsExport::class)

package content

typealias Sentence = String

@JsExport
interface TreeCommon : WithId {
    val sentence: Sentence
}
