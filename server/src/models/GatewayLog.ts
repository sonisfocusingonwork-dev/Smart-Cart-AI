import mongoose, { Schema, Document } from 'mongoose';

export interface IGatewayLog extends Document {
  cartId: string;
  staffName: string;
  status: 'pass' | 'hold';
  reason?: string;
  createdAt: Date;
}

const GatewayLogSchema: Schema = new Schema(
  {
    cartId: { type: String, required: true },
    staffName: { type: String, required: true },
    status: { type: String, enum: ['pass', 'hold'], required: true },
    reason: { type: String }
  },
  { timestamps: true }
);

export default mongoose.model<IGatewayLog>('GatewayLog', GatewayLogSchema);
