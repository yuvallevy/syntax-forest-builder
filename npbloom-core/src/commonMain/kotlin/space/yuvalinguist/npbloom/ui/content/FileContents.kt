@file:OptIn(ExperimentalJsExport::class)

package space.yuvalinguist.npbloom.ui.content

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import space.yuvalinguist.npbloom.ui.PanZoomState
import kotlin.js.ExperimentalJsExport
import kotlin.js.JsExport
import kotlin.js.JsName

@JsExport
@Serializable
data class FileContents(
    @SerialName("c") val contentState: ContentState,
    @SerialName("v") @JsName("plotPanZoomStatesAsKtList") val plotPanZoomStates: List<PanZoomState> = emptyList(),
) {
    @JsName("plotPanZoomStates") val plotPanZoomStatesAsArray get() = plotPanZoomStates.toTypedArray()

    companion object
}

@JsExport
fun createFileContents(contentState: ContentState, plotPanZoomStates: Array<PanZoomState>): FileContents =
    FileContents(contentState, plotPanZoomStates.toList())
