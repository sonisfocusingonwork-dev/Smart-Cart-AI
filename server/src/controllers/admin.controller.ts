import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import { normalizePhoneNumber, normalizeAdminRole } from '../utils/authUtils.js';

export const loginAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;
    
    // Fallback: accept username/password or phoneNumber/pinCode
    const loginId = username || req.body.phoneNumber;
    const pin = password || req.body.pinCode;

    if (!loginId || !pin) {
      res.status(400).json({ message: 'Số điện thoại/Tên đăng nhập và mã PIN/Mật khẩu là bắt buộc.' });
      return;
    }

    const normalizedLoginId = normalizePhoneNumber(loginId);
    const admin = await Admin.findOne({ phoneNumber: normalizedLoginId });
    if (!admin) {
      res.status(401).json({ message: 'không đúng tên hoặc mật khẩu' });
      return;
    }

    const isMatch = await bcrypt.compare(pin, admin.pinCode);
    if (!isMatch) {
      res.status(401).json({ message: 'không đúng tên hoặc mật khẩu' });
      return;
    }

    // Generate JWT token
    const tokenSecret = process.env.JWT_SECRET || 'smartcart-secret-key-123';
    const token = jwt.sign(
      { id: admin._id, phoneNumber: admin.phoneNumber, role: admin.role },
      tokenSecret,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      admin: {
        username: admin.phoneNumber,
        name: admin.name,
        role: normalizeAdminRole(admin.role)
      }
    });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
