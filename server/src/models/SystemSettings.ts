import mongoose, { Schema, Document } from 'mongoose';

export interface ISystemSettings extends Document {
  taxRate: number;
  paymentGatewayKeys: {
    stripe: string;
    paypal: string;
  };
}

const SystemSettingsSchema: Schema = new Schema(
  {
    taxRate: { type: Number, required: true, default: 0 },
    paymentGatewayKeys: {
      stripe: { type: String, default: '' },
      paypal: { type: String, default: '' }
    }
  },
  { timestamps: true }
);

export default mongoose.model<ISystemSettings>('SystemSettings', SystemSettingsSchema);
