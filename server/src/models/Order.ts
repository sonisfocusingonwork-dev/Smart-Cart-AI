import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderItem {
  name: string;
  qty: number;
  price: number;
}

export interface IOrder extends Document {
  id: string; // Custom string ID (e.g. "SC-260706-1842")
  completedAt: string;
  store: string;
  paymentMethod: string;
  items: IOrderItem[];
  discount: number;
  tax?: number;
  total: number;
  pointsEarned: number;
  appliedVoucherCode?: string;
}

const OrderItemSchema = new Schema({
  name: { type: String, required: true },
  qty: { type: Number, required: true },
  price: { type: Number, required: true },
}, { _id: false });

const OrderSchema: Schema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    completedAt: { type: String, required: true },
    store: { type: String, required: true },
    paymentMethod: { type: String, required: true },
    items: [OrderItemSchema],
    discount: { type: Number, required: true, default: 0 },
    tax: { type: Number, default: 0 },
    total: { type: Number, required: true },
    pointsEarned: { type: Number, required: true, default: 0 },
    appliedVoucherCode: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IOrder>('Order', OrderSchema);
