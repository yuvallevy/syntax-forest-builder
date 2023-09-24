@file:OptIn(ExperimentalJsExport::class)

package content

import content.serializers.StringSliceSerializer
import kotlinx.serialization.Serializable

typealias SliceStart = Int
typealias SliceEndExclusive = Int

@JsExport
@Serializable(StringSliceSerializer::class)
data class StringSlice(val start: SliceStart, val endExclusive: SliceEndExclusive) {
    val isZeroLength = start == endExclusive

    fun contentInString(str: String) = str.slice(start until endExclusive)

    /**
     * Returns whether this slice overlaps with the given one.
     */
    infix fun overlapsWith(other: StringSlice) = !(
        endExclusive < start || other.endExclusive < other.start ||
            endExclusive <= other.start || other.endExclusive <= start
    )

    /**
     * Returns whether this slice of the given string crosses a word boundary.
     */
    infix fun crossesWordBoundaryIn(str: String) =
        contentInString(str).let { it.isNotBlank() && ' ' in it }

    /**
     * Returns this slice with whitespace on both edges trimmed, using the given sentence.
     */
    fun trimSpacesForString(str: String) = contentInString(str).let { sliceContent ->
        val whitespaceBefore = sliceContent.length - sliceContent.trimStart().length
        val whitespaceAfter = sliceContent.length - sliceContent.trimEnd().length
        StringSlice(start + whitespaceBefore, endExclusive - whitespaceAfter)
    }
}
