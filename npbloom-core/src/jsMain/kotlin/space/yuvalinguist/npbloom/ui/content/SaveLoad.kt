@file:OptIn(ExperimentalJsExport::class)

package space.yuvalinguist.npbloom.ui.content

import space.yuvalinguist.npbloom.content.unpositioned.UnpositionedTree
import kotlin.js.ExperimentalJsExport
import kotlin.js.JsExport

@JsExport
fun fileContentsFromByteArray(byteArray: ByteArray) = FileContents.fromByteArray(byteArray)

@JsExport
fun treeFromByteArray(byteArray: ByteArray) = UnpositionedTree.fromByteArray(byteArray)
