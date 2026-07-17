import mongoose, { Schema, Document } from 'mongoose';

export interface ISystemLog extends Document {
  time: string;
  msg: string;
  type: 'info' | 'success' | 'warning' | 'danger';
}

const SystemLogSchema: Schema = new Schema(
  {
    time: { type: String, required: true },
    msg: { type: String, required: true },
    type: { type: String, enum: ['info', 'success', 'warning', 'danger'], default: 'info' },
  },
  { timestamps: true }
);

export default mongoose.model<ISystemLog>('SystemLog', SystemLogSchema);
