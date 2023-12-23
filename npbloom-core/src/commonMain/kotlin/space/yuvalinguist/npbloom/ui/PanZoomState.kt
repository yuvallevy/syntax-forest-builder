@file:OptIn(ExperimentalJsExport::class)

package space.yuvalinguist.npbloom.ui

import kotlin.js.ExperimentalJsExport
import kotlin.js.JsExport

typealias ZoomLevel = Double

@JsExport
data class PanZoomState(val panOffset: ClientCoordsOffset, val zoomLevel: ZoomLevel)
