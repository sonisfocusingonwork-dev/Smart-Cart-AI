import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  id: string; // Custom string ID (e.g. "P001")
  name: string;
  category: string;
  subCategory: string;
  price: number;
  quantity: number;
  revenue: number;
  stockLevel: number;
  lowStockAlert: boolean;
  image: string;
  barcode: string;
  coordinates: {
    x: number;
    y: number;
  };
}

const ProductSchema: Schema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    subCategory: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, default: 0 },
    revenue: { type: Number, required: true, default: 0 },
    stockLevel: { type: Number, default: 0 },
    lowStockAlert: { type: Boolean, default: false },
    image: { type: String, default: "" },
    barcode: { type: String, default: "" },
    coordinates: {
      x: { type: Number, default: 0 },
      y: { type: Number, default: 0 }
    }
  },
  { timestamps: true }
);

export default mongoose.model<IProduct>('Product', ProductSchema);
