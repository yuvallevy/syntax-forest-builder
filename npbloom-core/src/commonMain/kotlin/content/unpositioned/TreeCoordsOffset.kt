package content.unpositioned

typealias DTreeX = Double
typealias DTreeY = Double

@JsExport
data class TreeCoordsOffset(val dTreeX: DTreeX, val dTreeY: DTreeY) {
    operator fun plus(other: TreeCoordsOffset) =
        TreeCoordsOffset(dTreeX + other.dTreeX, dTreeY + other.dTreeY)

    companion object {
        val ZERO = TreeCoordsOffset(0.0, 0.0)
    }
}