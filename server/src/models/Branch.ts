import mongoose, { Schema, Document } from 'mongoose';

export interface IBranch extends Document {
  name: string;
  address?: string;
  status: 'active' | 'inactive';
}

const BranchSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    address: { type: String },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' }
  },
  { timestamps: true }
);

export default mongoose.model<IBranch>('Branch', BranchSchema);
