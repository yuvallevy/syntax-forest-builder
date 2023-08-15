@file:OptIn(ExperimentalJsExport::class)

package content

typealias SliceStart = Int
typealias SliceEndExclusive = Int

@JsExport
data class StringSlice(val start: SliceStart, val endExclusive: SliceEndExclusive) {
    val isZeroLength = start == endExclusive
}
