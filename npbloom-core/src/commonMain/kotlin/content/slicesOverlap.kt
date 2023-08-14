package content

/**
 * Returns whether the given slices overlap.
 */
internal fun slicesOverlap(slice1: StringSlice, slice2: StringSlice): Boolean {
    val (start1, end1) = slice1
    val (start2, end2) = slice2
    return !(end1 < start1 || end2 < start2 || end1 <= start2 || end2 <= start1)
}
