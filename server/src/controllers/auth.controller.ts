import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import QRSession from '../models/QRSession.js';

// Mock customer data for pairing success
const MOCK_CUSTOMER_DATA = {
  id: "guest_" + Math.random().toString(36).substring(2, 9),
  name: "Nguyễn Văn Khách",
  token: "mock_jwt_token_for_mobile_auth",
  shoppingHistory: [],
  loyaltyPoints: 1250,
  wishlist: [],
  availableVouchers: []
};

export const createQrSession = async (req: Request, res: Response) => {
  try {
    const sessionId = uuidv4();
    const newSession = new QRSession({ sessionId });
    await newSession.save();
    
    res.status(200).json({ 
      success: true, 
      sessionId,
      url: `/auth/pair?sessionId=${sessionId}`
    });
  } catch (error) {
    console.error("Error creating QR session:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const scanQrSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.body;
    
    if (!sessionId) {
      res.status(400).json({ success: false, message: "Missing sessionId" });
      return;
    }

    const session = await QRSession.findOne({ sessionId });
    if (!session) {
      res.status(404).json({ success: false, message: "Session expired or not found" });
      return;
    }

    if (session.status === 'WAITING') {
      session.status = 'SCANNED';
      await session.save();
      
      // Emit socket event to the tablet
      const io = req.app.get('io');
      io.to(`qr-${sessionId}`).emit('qr-scanned', { sessionId });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error scanning QR session:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const pairQrSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId, phone, name } = req.body;
    
    if (!sessionId) {
      res.status(400).json({ success: false, message: "Missing sessionId" });
      return;
    }

    const session = await QRSession.findOne({ sessionId });
    if (!session) {
      res.status(404).json({ success: false, message: "Session expired or not found" });
      return;
    }

    // In a real app, verify OTP/Credentials here. We assume success from the mobile frontend payload.
    
    // Create the customer payload
    const customerPayload = {
      ...MOCK_CUSTOMER_DATA,
      name: name || MOCK_CUSTOMER_DATA.name,
      phone: phone || null,
    };

    // Emit success event to the tablet
    const io = req.app.get('io');
    io.to(`qr-${sessionId}`).emit('qr-auth-success', { user: customerPayload });

    // Immediately destroy the session to prevent replay attacks
    await QRSession.deleteOne({ sessionId });

    res.status(200).json({ success: true, user: customerPayload });
  } catch (error) {
    console.error("Error pairing QR session:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
