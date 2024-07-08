@file:OptIn(ExperimentalSerializationApi::class, ExperimentalJsExport::class)

package space.yuvalinguist.npbloom.ui.content

import kotlinx.serialization.ExperimentalSerializationApi
import kotlinx.serialization.SerializationException
import kotlinx.serialization.cbor.*
import kotlinx.serialization.decodeFromByteArray
import kotlinx.serialization.encodeToByteArray
import space.yuvalinguist.npbloom.content.unpositioned.UnpositionedTree
import kotlin.js.ExperimentalJsExport
import kotlin.js.JsExport
import kotlin.js.JsName

@OptIn(ExperimentalStdlibApi::class)
private val forestMagicNumber = "59b10011f04e5700".hexToByteArray()
@OptIn(ExperimentalStdlibApi::class)
private val treeMagicNumber = "59b1001174ee0000".hexToByteArray()
private val formatVersion = byteArrayOf(1, 0)

@JsExport
@JsName("contentStateToFileContents")
fun ContentState.toFileContents() =
    forestMagicNumber + formatVersion + Cbor.encodeToByteArray(this)

@JsExport
@JsName("treeToFileContents")
fun UnpositionedTree.toFileContents() =
    treeMagicNumber + formatVersion + Cbor.encodeToByteArray(this)

fun ContentState.Companion.fromFileContents(byteArray: ByteArray): ContentState {
    if (!byteArray.sliceArray(forestMagicNumber.indices).contentEquals(forestMagicNumber)) error("This is not an NPBloom file")
    if (!byteArray.sliceArray(forestMagicNumber.size until forestMagicNumber.size + formatVersion.size)
        .contentEquals(formatVersion)) error("Unrecognized file format version")
    try {
        return Cbor.decodeFromByteArray(
            byteArray.sliceArray(forestMagicNumber.size + formatVersion.size until byteArray.size))
    } catch (e: SerializationException) {
        error("The file appears to be corrupt")
    }
}

fun UnpositionedTree.Companion.fromFileContents(byteArray: ByteArray): UnpositionedTree {
    if (!byteArray.sliceArray(treeMagicNumber.indices).contentEquals(treeMagicNumber)) error("This is not an NPBloom tree")
    if (!byteArray.sliceArray(treeMagicNumber.size until treeMagicNumber.size + formatVersion.size)
        .contentEquals(formatVersion)) error("Unrecognized file format version")
    try {
        return Cbor.decodeFromByteArray(
            byteArray.sliceArray(treeMagicNumber.size + formatVersion.size until byteArray.size))
    } catch (e: SerializationException) {
        error("The file appears to be corrupt")
    }
}
