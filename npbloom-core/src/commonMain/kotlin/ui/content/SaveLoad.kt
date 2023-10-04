@file:OptIn(ExperimentalSerializationApi::class, ExperimentalJsExport::class)

package ui.content

import kotlinx.serialization.ExperimentalSerializationApi
import kotlinx.serialization.SerializationException
import kotlinx.serialization.cbor.*
import kotlinx.serialization.decodeFromByteArray
import kotlinx.serialization.encodeToByteArray

@OptIn(ExperimentalStdlibApi::class)
private val magicNumber = "59b10011f04e5700".hexToByteArray()
private val formatVersion = byteArrayOf(1, 0)

@JsExport
@JsName("contentStateToFileContents")
fun ContentState.toFileContents() =
    magicNumber + formatVersion + Cbor.encodeToByteArray(this)

fun ContentState.Companion.fromFileContents(byteArray: ByteArray): ContentState {
    if (!byteArray.sliceArray(magicNumber.indices).contentEquals(magicNumber)) error("This is not an NPBloom file")
    if (!byteArray.sliceArray(magicNumber.size until magicNumber.size + formatVersion.size)
        .contentEquals(formatVersion)) error("Unrecognized file format version")
    try {
        return Cbor.decodeFromByteArray(
            byteArray.sliceArray(magicNumber.size + formatVersion.size until byteArray.size))
    } catch (e: SerializationException) {
        error("The file appears to be corrupt")
    }
}
