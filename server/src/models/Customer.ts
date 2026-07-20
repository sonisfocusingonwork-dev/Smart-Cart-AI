import mongoose, { Schema, Document } from 'mongoose';

export interface ICustomer extends Document {
  fullName: string;
  age?: number;
  phoneNumber?: string;
  pinCode?: string;
  qrCode?: string;
  email?: string;
  isEmailVerified: boolean;
  otp?: string;
  points: number;
  membershipTier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  purchaseHistory: mongoose.Types.ObjectId[];
}

const CustomerSchema: Schema = new Schema(
  {
    fullName: { type: String, required: true },
    age: { type: Number },
    phoneNumber: { type: String, unique: true, sparse: true },
    pinCode: { type: String },
    qrCode: { type: String, unique: true, sparse: true },
    email: { type: String, unique: true, sparse: true },
    isEmailVerified: { type: Boolean, required: true, default: false },
    otp: { type: String },
    points: { type: Number, required: true, default: 1250 },
    membershipTier: { 
      type: String, 
      enum: ['Bronze', 'Silver', 'Gold', 'Platinum'], 
      default: 'Bronze' 
    },
    purchaseHistory: [{ type: Schema.Types.ObjectId, ref: 'Order' }]
  },
  { timestamps: true }
);

export default mongoose.model<ICustomer>('Customer', CustomerSchema);
