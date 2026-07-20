import mongoose, { Schema, Document } from 'mongoose';

export interface IQRSession extends Document {
  sessionId: string;
  status: 'WAITING' | 'SCANNED' | 'SUCCESS' | 'EXPIRED';
  createdAt: Date;
}

const QRSessionSchema: Schema = new Schema({
  sessionId: { type: String, required: true, unique: true },
  status: { type: String, enum: ['WAITING', 'SCANNED', 'SUCCESS', 'EXPIRED'], default: 'WAITING' },
  createdAt: { type: Date, default: Date.now, expires: 60 } // Automatically expires after 60 seconds
});

export default mongoose.model<IQRSession>('QRSession', QRSessionSchema);
