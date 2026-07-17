import mongoose, { Schema, Document } from 'mongoose';

export interface IAdmin extends Document {
  phoneNumber: string;
  pinCode: string;
  name: string;
  role: 'RootAdmin' | 'StoreManager' | 'Tech' | 'Security';
  branchId?: mongoose.Types.ObjectId;
}

const AdminSchema: Schema = new Schema(
  {
    phoneNumber: { type: String, required: true, unique: true },
    pinCode: { type: String, required: true },
    name: { type: String, required: true },
    role: { 
      type: String, 
      enum: ['RootAdmin', 'StoreManager', 'Tech', 'Security'],
      required: true, 
      default: 'RootAdmin' 
    },
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch' }
  },
  { timestamps: true }
);

export default mongoose.model<IAdmin>('Admin', AdminSchema);
