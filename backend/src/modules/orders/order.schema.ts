import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type OrderDocument = HydratedDocument<Order> & {
    createdAt: Date;
    updatedAt: Date;
};

@Schema({ timestamps: true })
export class Order {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    userId!: Types.ObjectId;

    @Prop({ required: true, min: 0 })
    amount!: number;

    @Prop({ type: Types.ObjectId, ref: 'Promocode', default: null })
    promocodeId!: Types.ObjectId | null;

    @Prop({ type: Number, default: null })
    discountAmount!: number | null;

    @Prop({ type: String, default: null })
    promocodeCode!: string | null;
}

export const OrderSchema = SchemaFactory.createForClass(Order);