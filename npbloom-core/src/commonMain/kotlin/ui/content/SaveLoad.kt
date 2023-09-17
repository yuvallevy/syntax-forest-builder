package ui.content

import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.*

private const val FORMAT_VERSION_KEY = "version"
private const val FORMAT_VERSION = 1

fun ContentState.serialize() =
    Json.encodeToString(
        JsonObject(
            mapOf(FORMAT_VERSION_KEY to JsonPrimitive(FORMAT_VERSION)) +
                    Json.encodeToJsonElement(this).jsonObject
        )
    )

fun ContentState.Companion.fromSerialized(string: String) =
    Json.decodeFromJsonElement<ContentState>(
        JsonObject(
            Json.parseToJsonElement(string).jsonObject - FORMAT_VERSION_KEY
        )
    )