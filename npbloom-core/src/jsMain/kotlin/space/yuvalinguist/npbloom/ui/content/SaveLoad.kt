@file:OptIn(ExperimentalJsExport::class)

package space.yuvalinguist.npbloom.ui.content

@JsExport
fun contentStateFromFileContents(byteArray: ByteArray) = ContentState.fromFileContents(byteArray)
