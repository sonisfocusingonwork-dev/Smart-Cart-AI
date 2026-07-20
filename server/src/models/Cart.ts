import mongoose, { Schema, Document } from 'mongoose';

export interface ICart extends Document {
  id: string; // Custom string ID (e.g. "C001")
  name: string;
  status: 'active' | 'inactive' | 'maintenance';
  battery: number;
  lastConnected: string;
  currentSession?: string;
  currentCustomer?: mongoose.Types.ObjectId;
  hardwareStatus: {
    camera: 'Good' | 'Error';
    scale: 'Good' | 'Error';
    barcodeScanner: 'Good' | 'Error';
  };
  currentZone: string;
  coordinates: {
    x: number;
    y: number;
  };
  batteryLevel: number;
}

const CartSchema: Schema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    status: { type: String, enum: ['active', 'inactive', 'maintenance'], default: 'inactive' },
    battery: { type: Number, required: true, min: 0, max: 100, default: 100 },
    lastConnected: { type: String, required: true, default: 'Vừa xong' },
    currentSession: { type: String },
    currentCustomer: { type: Schema.Types.ObjectId, ref: 'Customer', default: null },
    hardwareStatus: {
      camera: { type: String, enum: ['Good', 'Error'], default: 'Good' },
      scale: { type: String, enum: ['Good', 'Error'], default: 'Good' },
      barcodeScanner: { type: String, enum: ['Good', 'Error'], default: 'Good' }
    },
    currentZone: { type: String, default: 'Aisle 1' },
    coordinates: {
      x: { type: Number, default: 0 },
      y: { type: Number, default: 0 }
    },
    batteryLevel: { type: Number, default: 100 }
  },
  { timestamps: true }
);

export default mongoose.model<ICart>('Cart', CartSchema);
