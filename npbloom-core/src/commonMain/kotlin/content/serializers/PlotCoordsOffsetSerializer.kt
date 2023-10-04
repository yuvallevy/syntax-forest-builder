package content.serializers

import content.unpositioned.PlotCoordsOffset
import kotlinx.serialization.ExperimentalSerializationApi
import kotlinx.serialization.KSerializer
import kotlinx.serialization.builtins.DoubleArraySerializer
import kotlinx.serialization.descriptors.SerialDescriptor
import kotlinx.serialization.encoding.Decoder
import kotlinx.serialization.encoding.Encoder

object PlotCoordsOffsetSerializer : KSerializer<PlotCoordsOffset> {
    private val delegateSerializer = DoubleArraySerializer()
    @ExperimentalSerializationApi
    override val descriptor = SerialDescriptor("PlotCoordsOffset", delegateSerializer.descriptor)

    override fun serialize(encoder: Encoder, value: PlotCoordsOffset) =
        encoder.encodeSerializableValue(delegateSerializer, doubleArrayOf(value.dPlotX, value.dPlotY))

    override fun deserialize(decoder: Decoder) = decoder.decodeSerializableValue(delegateSerializer)
        .let { (dPlotX, dPlotY) -> PlotCoordsOffset(dPlotX, dPlotY) }
}
