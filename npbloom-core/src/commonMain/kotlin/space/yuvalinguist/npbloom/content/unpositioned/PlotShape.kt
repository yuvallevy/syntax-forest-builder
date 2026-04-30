@file:OptIn(ExperimentalJsExport::class)

package space.yuvalinguist.npbloom.content.unpositioned

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import space.yuvalinguist.npbloom.content.Id
import space.yuvalinguist.npbloom.content.WithId
import space.yuvalinguist.npbloom.content.positioned.CoordsInPlot
import kotlin.js.ExperimentalJsExport
import kotlin.js.JsExport

@JsExport
@Serializable
sealed interface PlotShape : WithId {
    val strokeColor: String
    val strokeWidth: Double
    fun move(offset: PlotCoordsOffset): PlotShape
}

@JsExport
@Serializable
@SerialName("LS")
data class LineShape(
    @SerialName("i") override val id: Id,
    @SerialName("s") val start: CoordsInPlot,
    @SerialName("e") val end: CoordsInPlot,
    @SerialName("a") val arrowhead: Arrowhead = Arrowhead.None,
    @SerialName("_") override val strokeColor: String = "#000000",
    @SerialName("=") override val strokeWidth: Double = 1.0,
) : PlotShape {
    override fun move(offset: PlotCoordsOffset) = copy(
        start = start + offset,
        end = end + offset,
    )
}

@JsExport
@Serializable
@SerialName("EN")
data class EnclosureShape(
    @SerialName("i") override val id: Id,
    @SerialName("x") val x: Double,
    @SerialName("y") val y: Double,
    @SerialName("w") val width: Double,
    @SerialName("h") val height: Double,
    @SerialName("r") val cornerRadius: Double = 0.0,
    @SerialName("_") override val strokeColor: String = "#000000",
    @SerialName("=") override val strokeWidth: Double = 1.0,
    @SerialName("#") val fillColor: String? = null,
) : PlotShape {
    override fun move(offset: PlotCoordsOffset) = copy(
        x = x + offset.dPlotX,
        y = y + offset.dPlotY,
    )
}

@JsExport
@Serializable
enum class Arrowhead {
    @SerialName("N") None,
    @SerialName("E") End,
    @SerialName("S") Start,
    @SerialName("B") Both,
}
