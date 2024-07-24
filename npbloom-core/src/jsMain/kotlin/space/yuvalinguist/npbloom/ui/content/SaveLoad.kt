@file:OptIn(ExperimentalJsExport::class)

package space.yuvalinguist.npbloom.ui.content

import space.yuvalinguist.npbloom.content.unpositioned.UnpositionedTree

@JsExport
fun contentStateFromFileContents(byteArray: ByteArray) = ContentState.fromFileContents(byteArray)

@JsExport
fun treeFromFileContents(byteArray: ByteArray) = UnpositionedTree.fromFileContents(byteArray)
