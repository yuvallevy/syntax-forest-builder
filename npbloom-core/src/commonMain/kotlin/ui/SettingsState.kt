@file:OptIn(ExperimentalJsExport::class)

package ui

import kotlin.js.ExperimentalJsExport
import kotlin.js.JsExport

@JsExport
sealed interface SettingsAction {
    val key: String
    val value: String
}

@JsExport
class SetAutoFormatSubscript(val autoFormatSubscript: Boolean) : SettingsAction {
    override val key = "autoFormatSubscript"
    override val value = autoFormatSubscript.toString()
}

@JsExport
class SetLiveStringWidth(val liveStringWidth: Boolean) : SettingsAction {
    override val key = "liveStringWidth"
    override val value = liveStringWidth.toString()
}

@JsExport
data class SettingsState(
    val autoFormatSubscript: Boolean,
    val liveStringWidth: Boolean,
)

@JsExport
fun settingsReducer(state: SettingsState, action: SettingsAction): SettingsState =
    when (action) {
        is SetAutoFormatSubscript -> state.copy(autoFormatSubscript = action.autoFormatSubscript)
        is SetLiveStringWidth -> state.copy(liveStringWidth = action.liveStringWidth)
    }
