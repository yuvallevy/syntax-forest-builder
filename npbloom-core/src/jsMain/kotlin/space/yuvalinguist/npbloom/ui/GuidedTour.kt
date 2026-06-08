package space.yuvalinguist.npbloom.ui

import kotlinx.browser.window

actual fun getViewportWidth(): Int = window.innerWidth

actual fun getViewportHeight(): Int = window.innerHeight