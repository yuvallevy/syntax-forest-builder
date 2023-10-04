@file:OptIn(ExperimentalJsExport::class)

package content

import kotlinx.serialization.SerialName

@JsExport
enum class YAlignMode {
    @SerialName("^") Top,
    @SerialName("v") Bottom,
}
