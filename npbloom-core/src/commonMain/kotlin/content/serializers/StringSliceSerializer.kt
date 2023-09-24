package content.serializers

import content.StringSlice
import kotlinx.serialization.ExperimentalSerializationApi
import kotlinx.serialization.KSerializer
import kotlinx.serialization.builtins.IntArraySerializer
import kotlinx.serialization.descriptors.SerialDescriptor
import kotlinx.serialization.encoding.Decoder
import kotlinx.serialization.encoding.Encoder

object StringSliceSerializer : KSerializer<StringSlice> {
    private val delegateSerializer = IntArraySerializer()
    @ExperimentalSerializationApi
    override val descriptor = SerialDescriptor("PlotCoordsOffset", delegateSerializer.descriptor)

    override fun serialize(encoder: Encoder, value: StringSlice) =
        encoder.encodeSerializableValue(delegateSerializer, intArrayOf(value.start, value.endExclusive))

    override fun deserialize(decoder: Decoder) = decoder.decodeSerializableValue(delegateSerializer)
        .let { (start, endExclusive) -> StringSlice(start, endExclusive) }
}
