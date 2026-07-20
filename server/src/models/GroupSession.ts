import mongoose, { Schema, Document } from 'mongoose';

export interface IGroupMember {
  member: string;
  cartId: string;
  tone: string;
}

export interface IGroupItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  tone: string;
  category?: string;
  addedBy?: string;
}

export interface IGroupShoppingListItem {
  name: string;
  checked: boolean;
  addedBy?: string;
}

export interface IGroupSession extends Document {
  code: string; // unique group session code, e.g., SC-123456
  members: IGroupMember[];
  items: IGroupItem[];
  manualList: IGroupShoppingListItem[];
  updatedAtTimestamp: number;
  sourceId: string;
}

const GroupMemberSchema = new Schema({
  member: { type: String, required: true },
  cartId: { type: String, required: true },
  tone: { type: String, required: true },
}, { _id: false });

const GroupItemSchema = new Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  qty: { type: Number, required: true },
  tone: { type: String, required: true },
  category: { type: String },
  addedBy: { type: String },
}, { _id: false });

const GroupShoppingListItemSchema = new Schema({
  name: { type: String, required: true },
  checked: { type: Boolean, required: true, default: false },
  addedBy: { type: String },
}, { _id: false });

const GroupSessionSchema: Schema = new Schema(
  {
    code: { type: String, required: true, unique: true },
    members: [GroupMemberSchema],
    items: [GroupItemSchema],
    manualList: [GroupShoppingListItemSchema],
    updatedAtTimestamp: { type: Number, required: true },
    sourceId: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IGroupSession>('GroupSession', GroupSessionSchema);
