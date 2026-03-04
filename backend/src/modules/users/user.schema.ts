import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User> & {
    createdAt: Date;
    updatedAt: Date;
};

@Schema({ timestamps: true })
export class User {
    @Prop({ required: true, unique: true, lowercase: true, trim: true })
    email!: string;

    @Prop({ required: true, trim: true })
    name!: string;

    @Prop({ required: true })
    phone!: string;

    @Prop({ required: true, select: false })
    passwordHash!: string;

    @Prop({ default: true })
    isActive!: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);