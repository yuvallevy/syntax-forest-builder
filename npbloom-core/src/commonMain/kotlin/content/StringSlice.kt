@file:OptIn(ExperimentalJsExport::class)

package content

typealias SliceStart = Int
typealias SliceEndExclusive = Int

@JsExport
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
     * Returns whether this slice of the given string covers more than one word.
     */
    infix fun crossesWordBoundaryIn(str: String) = ' ' in contentInString(str)
}
