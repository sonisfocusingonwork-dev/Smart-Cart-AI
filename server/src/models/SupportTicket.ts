import mongoose, { Schema, Document } from 'mongoose';

export interface ISupportTicket extends Document {
  cartId: string;
  issueType: 'hardware' | 'assistance';
  status: 'open' | 'resolved';
  locationZone: string;
}

const SupportTicketSchema: Schema = new Schema(
  {
    cartId: { type: String, required: true },
    issueType: { type: String, enum: ['hardware', 'assistance'], required: true },
    status: { type: String, enum: ['open', 'resolved'], default: 'open' },
    locationZone: { type: String, required: true }
  },
  { timestamps: true }
);

export default mongoose.model<ISupportTicket>('SupportTicket', SupportTicketSchema);
