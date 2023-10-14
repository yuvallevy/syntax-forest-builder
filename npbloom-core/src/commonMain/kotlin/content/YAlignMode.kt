@file:OptIn(ExperimentalJsExport::class)

package content

import kotlinx.serialization.SerialName
import kotlin.js.ExperimentalJsExport
import kotlin.js.JsExport

@JsExport
enum class YAlignMode {
    @SerialName("^") Top,
    @SerialName("v") Bottom,
}
