/* eslint-disable prettier/prettier */
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

@Schema()
export class Event extends Document {
  @Prop()
  type: string;

  @Prop({index: true})
  name: string;

  @Prop({ type: mongoose.Schema.Types.Mixed, default: {} })
  payload: Record<string, any>;
}

export const EventSchema = SchemaFactory.createForClass(Event);
EventSchema.index({name: 1, type: -1})
