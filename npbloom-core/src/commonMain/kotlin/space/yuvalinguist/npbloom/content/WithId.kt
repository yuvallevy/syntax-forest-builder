@file:OptIn(ExperimentalJsExport::class)

package space.yuvalinguist.npbloom.content

import kotlin.js.ExperimentalJsExport
import kotlin.js.JsExport

@JsExport
interface WithId {
    val id: Id
}
