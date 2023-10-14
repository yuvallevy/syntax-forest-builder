@file:OptIn(ExperimentalJsExport::class)

package space.yuvalinguist.npbloom.content.unpositioned

import space.yuvalinguist.npbloom.content.serializers.TreeCoordsOffsetSerializer
import kotlinx.serialization.Serializable
import kotlin.js.ExperimentalJsExport
import kotlin.js.JsExport

typealias DTreeX = Double
typealias DTreeY = Double

@JsExport
@Serializable(TreeCoordsOffsetSerializer::class)
data class TreeCoordsOffset(val dTreeX: DTreeX, val dTreeY: DTreeY) {
    internal operator fun plus(other: TreeCoordsOffset) =
        TreeCoordsOffset(dTreeX + other.dTreeX, dTreeY + other.dTreeY)

    internal companion object {
        val ZERO = TreeCoordsOffset(0.0, 0.0)
    }
}
