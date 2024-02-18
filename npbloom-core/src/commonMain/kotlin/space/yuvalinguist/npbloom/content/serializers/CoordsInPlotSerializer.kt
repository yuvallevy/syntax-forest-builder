package space.yuvalinguist.npbloom.content.serializers

import kotlinx.serialization.ExperimentalSerializationApi
import kotlinx.serialization.KSerializer
import kotlinx.serialization.builtins.DoubleArraySerializer
import kotlinx.serialization.descriptors.SerialDescriptor
import kotlinx.serialization.encoding.Decoder
import kotlinx.serialization.encoding.Encoder
import space.yuvalinguist.npbloom.content.positioned.CoordsInPlot

object CoordsInPlotSerializer : KSerializer<CoordsInPlot> {
    private val delegateSerializer = DoubleArraySerializer()
    @ExperimentalSerializationApi
    override val descriptor = SerialDescriptor("CoordsInPlot", delegateSerializer.descriptor)

    override fun serialize(encoder: Encoder, value: CoordsInPlot) =
        encoder.encodeSerializableValue(delegateSerializer, doubleArrayOf(value.plotX, value.plotY))

    override fun deserialize(decoder: Decoder) = decoder.decodeSerializableValue(delegateSerializer)
        .let { (plotX, plotY) -> CoordsInPlot(plotX, plotY) }
}
