@file:OptIn(ExperimentalJsExport::class)

package space.yuvalinguist.npbloom.content

import space.yuvalinguist.npbloom.content.serializers.StringSliceSerializer
import kotlinx.serialization.Serializable
import kotlin.js.ExperimentalJsExport
import kotlin.js.JsExport

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

    /**
     * Returns the slices that result from removing the given slice from this one.
     * Always returns zero, one, or two slices. All returned slices are non-zero-length.
     * The result is the difference between the slices, not the intersection, so this operation is not commutative.
     *
     * StringSlice(0, 10) - StringSlice(5, 15) = [StringSlice(0, 5)]
     * StringSlice(0, 10) - StringSlice(0, 5) = [StringSlice(5, 10)]
     * StringSlice(0, 10) - StringSlice(3, 7) = [StringSlice(0, 3), StringSlice(7, 10)]
     * StringSlice(3, 7) - StringSlice(0, 10) = []
     * StringSlice(0, 10) - StringSlice(0, 10) = []
     */
    operator fun minus(otherSlice: StringSlice): List<StringSlice> = when {
        isZeroLength -> emptyList()
        otherSlice.isZeroLength -> listOf(this)
        this == otherSlice -> emptyList()
        // The slices do not overlap
        !overlapsWith(otherSlice) -> listOf(this)
        // This slice is entirely within the other slice
        start >= otherSlice.start && endExclusive <= otherSlice.endExclusive -> emptyList()
        // The other slice is entirely within this slice
        start <= otherSlice.start && endExclusive >= otherSlice.endExclusive -> listOf(
            StringSlice(start, otherSlice.start),
            StringSlice(otherSlice.endExclusive, endExclusive)
        )
        // The slices overlap without being contained within each other, and this slice starts before the other
        start < otherSlice.start -> listOf(StringSlice(start, otherSlice.start))
        // The slices overlap without being contained within each other, and this slice starts after the other
        else -> listOf(StringSlice(otherSlice.endExclusive, endExclusive))
    }.filterNot(StringSlice::isZeroLength)
}
