import mongoose, { Schema, Document } from 'mongoose';

export interface ISecurityAlert extends Document {
  id: string; // Custom string ID (e.g. "AL-001")
  cartId: string;
  cartName: string;
  time: string;
  type: 'Lệch cân nặng' | 'Camera AI phát hiện vật lạ';
  severity: 'high' | 'medium';
  status: 'pending' | 'resolved';
  details: string;
}

const SecurityAlertSchema: Schema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    cartId: { type: String, required: true },
    cartName: { type: String, required: true },
    time: { type: String, required: true },
    type: { type: String, enum: ['Lệch cân nặng', 'Camera AI phát hiện vật lạ'], required: true },
    severity: { type: String, enum: ['high', 'medium'], required: true },
    status: { type: String, enum: ['pending', 'resolved'], default: 'pending' },
    details: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<ISecurityAlert>('SecurityAlert', SecurityAlertSchema);
