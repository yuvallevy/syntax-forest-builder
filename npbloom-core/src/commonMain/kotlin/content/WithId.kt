@file:OptIn(ExperimentalJsExport::class)

package content

import kotlin.js.ExperimentalJsExport
import kotlin.js.JsExport

@JsExport
interface WithId {
    val id: Id
}
