@file:OptIn(ExperimentalJsExport::class)

package space.yuvalinguist.npbloom.ui.content

import kotlin.js.ExperimentalJsExport
import kotlin.js.JsExport

private val subscriptSubstitutions = mapOf(
    '0' to '\u2080',
    '1' to '\u2081',
    '2' to '\u2082',
    '3' to '\u2083',
    '4' to '\u2084',
    '5' to '\u2085',
    '6' to '\u2086',
    '7' to '\u2087',
    '8' to '\u2088',
    '9' to '\u2089',
    'a' to '\u2090',
    'e' to '\u2091',
    'h' to '\u2095',
    'i' to '\u1d62',
    'j' to '\u2c7c',
    'k' to '\u2096',
    'l' to '\u2097',
    'm' to '\u2098',
    'n' to '\u2099',
    'o' to '\u2092',
    'p' to '\u209a',
    'r' to '\u1d63',
    's' to '\u209b',
    't' to '\u209c',
    'u' to '\u1d64',
    'v' to '\u1d65',
    'x' to '\u2093',
)

private fun formatSubscriptContent(plainSubscriptContent: String): String? =
    plainSubscriptContent.map {
        if (it !in subscriptSubstitutions) return@formatSubscriptContent null
        subscriptSubstitutions[it]
    }.joinToString("")

@JsExport
fun formatSubscriptInString(stringEndingInSubscript: String): String? =
    if (stringEndingInSubscript.endsWith(')') || stringEndingInSubscript.endsWith(']')) {
        val matchingBracket = if (stringEndingInSubscript.endsWith(')')) '(' else '['
        val openingBracketIndex = stringEndingInSubscript.lastIndexOf(matchingBracket)
        val bracketContent =
            stringEndingInSubscript.slice(openingBracketIndex + 1 until stringEndingInSubscript.length - 1)
        formatSubscriptContent(bracketContent)?.let { formattedSubscript ->
            stringEndingInSubscript.slice(0 until openingBracketIndex) + formattedSubscript
        }
    } else null
