@file:OptIn(ExperimentalJsExport::class)

package space.yuvalinguist.npbloom

import kotlin.js.ExperimentalJsExport
import kotlin.js.JsExport

// Basic mapping of letter to width, for testing purposes only
private val charWidths: Map<Char, Double> = mapOf(
    ' ' to 4.0,
    '.' to 4.0,
    'A' to 12.0,
    'B' to 11.0,
    'C' to 11.0,
    'D' to 12.0,
    'E' to 10.0,
    'F' to 9.0,
    'G' to 12.0,
    'H' to 12.0,
    'I' to 5.0,
    'J' to 6.0,
    'K' to 12.0,
    'L' to 10.0,
    'M' to 14.0,
    'N' to 12.0,
    'O' to 12.0,
    'P' to 9.0,
    'Q' to 12.0,
    'R' to 11.0,
    'S' to 9.0,
    'T' to 10.0,
    'U' to 12.0,
    'V' to 12.0,
    'W' to 15.0,
    'X' to 12.0,
    'Y' to 12.0,
    'Z' to 10.0,
    'a' to 7.0,
    'b' to 8.0,
    'c' to 7.0,
    'd' to 8.0,
    'e' to 7.0,
    'f' to 5.0,
    'g' to 8.0,
    'h' to 8.0,
    'i' to 4.0,
    'j' to 4.0,
    'k' to 8.0,
    'l' to 4.0,
    'm' to 12.0,
    'n' to 8.0,
    'o' to 8.0,
    'p' to 8.0,
    'q' to 8.0,
    'r' to 5.0,
    's' to 6.0,
    't' to 4.0,
    'u' to 8.0,
    'v' to 8.0,
    'w' to 12.0,
    'x' to 8.0,
    'y' to 8.0,
    'z' to 7.0,
)

@JsExport
fun mockStrWidth(str: String): Double =
    str.toCharArray().fold(0.0) { width, nextChar -> width + (charWidths[nextChar] ?: 8.0) }
