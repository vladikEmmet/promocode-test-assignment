import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PromocodeDocument = HydratedDocument<Promocode> & {
    createdAt: Date;
    updatedAt: Date;
};

@Schema({ timestamps: true })
export class Promocode {
    @Prop({ required: true, unique: true, uppercase: true, trim: true })
    code!: string;

    @Prop({ required: true, min: 1, max: 100 })
    discount!: number;

    @Prop({ type: Number, default: null })
    usageLimit!: number | null;

    @Prop({ type: Number, default: null })
    perUserLimit!: number | null;

    @Prop({ type: Date, default: null })
    dateFrom!: Date | null;

    @Prop({ type: Date, default: null })
    dateTo!: Date | null;

    @Prop({ default: true })
    isActive!: boolean;
}

export const PromocodeSchema = SchemaFactory.createForClass(Promocode);