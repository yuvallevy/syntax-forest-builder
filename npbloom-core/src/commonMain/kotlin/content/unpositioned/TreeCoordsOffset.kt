@file:OptIn(ExperimentalJsExport::class)

package content.unpositioned

typealias DTreeX = Double
typealias DTreeY = Double

@JsExport
data class TreeCoordsOffset(val dTreeX: DTreeX, val dTreeY: DTreeY) {
    internal operator fun plus(other: TreeCoordsOffset) =
        TreeCoordsOffset(dTreeX + other.dTreeX, dTreeY + other.dTreeY)

    internal companion object {
        val ZERO = TreeCoordsOffset(0.0, 0.0)
    }
}
