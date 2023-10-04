@file:OptIn(ExperimentalJsExport::class)

package ui.content

@JsExport
fun contentStateFromFileContents(byteArray: ByteArray) = ContentState.fromFileContents(byteArray)
