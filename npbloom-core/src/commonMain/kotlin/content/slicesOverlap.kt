@file:OptIn(ExperimentalJsExport::class)

package content

/**
 * Returns whether the given slices overlap.
 */
@JsExport
fun slicesOverlap(slice1: Array<Int>, slice2: Array<Int>): Boolean {
    val (start1, end1) = slice1
    val (start2, end2) = slice2
    return !(end1 < start1 || end2 < start2 || end1 <= start2 || end2 <= start1)
}
