package space.yuvalinguist.npbloom.ui.content

import kotlin.js.Date

internal actual fun timeAsNumber() = Date().getTime().toLong()
