@file:OptIn(ExperimentalJsExport::class)

package content

typealias SliceStart = Int
typealias SliceEndExclusive = Int

@JsExport
data class StringSlice(val start: SliceStart, val endExclusive: SliceEndExclusive) {
    val isZeroLength = start == endExclusive

    /**
     * Returns whether this slice overlaps with the given one.
     */
    infix fun overlapsWith(other: StringSlice) = !(
        endExclusive < start || other.endExclusive < other.start ||
            endExclusive <= other.start || other.endExclusive <= start
    )

    /**
     * Returns whether this slice of the given sentence covers more than one word.
     */
    infix fun crossesWordBoundaryIn(sentence: Sentence) =
        ' ' in sentence.slice(start until endExclusive)
}
