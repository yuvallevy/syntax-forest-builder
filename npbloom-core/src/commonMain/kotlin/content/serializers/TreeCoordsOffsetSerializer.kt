package content.serializers

import content.unpositioned.TreeCoordsOffset
import kotlinx.serialization.ExperimentalSerializationApi
import kotlinx.serialization.KSerializer
import kotlinx.serialization.builtins.DoubleArraySerializer
import kotlinx.serialization.descriptors.SerialDescriptor
import kotlinx.serialization.encoding.Decoder
import kotlinx.serialization.encoding.Encoder

object TreeCoordsOffsetSerializer : KSerializer<TreeCoordsOffset> {
    private val delegateSerializer = DoubleArraySerializer()
    @ExperimentalSerializationApi
    override val descriptor = SerialDescriptor("TreeCoordsOffset", delegateSerializer.descriptor)

    override fun serialize(encoder: Encoder, value: TreeCoordsOffset) =
        encoder.encodeSerializableValue(delegateSerializer, doubleArrayOf(value.dTreeX, value.dTreeY))

    override fun deserialize(decoder: Decoder) = decoder.decodeSerializableValue(delegateSerializer)
        .let { (dTreeX, dTreeY) -> TreeCoordsOffset(dTreeX, dTreeY) }
}
