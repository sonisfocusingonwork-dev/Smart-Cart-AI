import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Customer from '../models/Customer.js';
import Admin from '../models/Admin.js';
import { sendVerificationEmail } from '../config/mail.js';

export const getCustomers = async (req: Request, res: Response): Promise<void> => {
  try {
    const customers = await Customer.find().populate('purchaseHistory', 'total completedAt');
    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const loginCustomer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phoneNumber, pinCode } = req.body;
    if (!phoneNumber || !pinCode) {
      res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin đăng nhập và mã PIN.' });
      return;
    }

    const loginId = phoneNumber.trim();
    const pin = pinCode.trim();

    const cleanPhone = loginId.replace(/\s+/g, '');

    // 1. Check Admin database first
    const admin = await Admin.findOne({ phoneNumber: cleanPhone });
    if (admin) {
      const isMatch = await bcrypt.compare(pin, admin.pinCode);
      if (isMatch) {
        // Generate JWT token for admin
        const tokenSecret = process.env.JWT_SECRET || 'smartcart-secret-key-123';
        const token = jwt.sign(
          { id: admin._id, phoneNumber: admin.phoneNumber, role: 'admin' },
          tokenSecret,
          { expiresIn: '30d' }
        );

        res.status(200).json({
          token,
          customer: {
            _id: admin._id,
            fullName: admin.name,
            phoneNumber: admin.phoneNumber,
            role: 'admin',
            points: 0
          },
          user: {
            name: admin.name,
            phoneNumber: admin.phoneNumber,
            role: 'admin'
          }
        });
        return;
      }
    }

    // 2. Check Customer database
    let customer;
    if (loginId.includes('@')) {
      customer = await Customer.findOne({ email: loginId.toLowerCase() });
    } else {
      customer = await Customer.findOne({ phoneNumber: cleanPhone });
    }

    if (!customer || !customer.pinCode) {
      res.status(401).json({ message: 'Sai thông tin đăng nhập hoặc mã PIN' });
      return;
    }

    const isMatch = await bcrypt.compare(pin, customer.pinCode);
    if (!isMatch) {
      res.status(401).json({ message: 'Sai thông tin đăng nhập hoặc mã PIN' });
      return;
    }

    // Generate JWT token for customer
    const tokenSecret = process.env.JWT_SECRET || 'smartcart-secret-key-123';
    const token = jwt.sign(
      { id: customer._id, phoneNumber: customer.phoneNumber, role: 'customer' },
      tokenSecret,
      { expiresIn: '30d' }
    );

    res.status(200).json({
      token,
      customer: {
        _id: customer._id,
        fullName: customer.fullName,
        phoneNumber: customer.phoneNumber,
        role: 'customer',
        points: customer.points
      },
      user: {
        name: customer.fullName,
        phoneNumber: customer.phoneNumber,
        role: 'customer'
      }
    });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const loginWithQR = async (req: Request, res: Response): Promise<void> => {
  try {
    const { qrCode } = req.body;
    const code = qrCode || 'QR-MEMBER-' + Math.floor(1000 + Math.random() * 9000);

    let customer = await Customer.findOne({ qrCode: code });
    if (!customer) {
      customer = new Customer({
        qrCode: code,
        fullName: 'Thành viên Smart Cart',
        isEmailVerified: false,
        points: 1250
      });
      await customer.save();
    }

    // Generate JWT token
    const tokenSecret = process.env.JWT_SECRET || 'smartcart-secret-key-123';
    const token = jwt.sign(
      { id: customer._id, qrCode: customer.qrCode, role: 'customer' },
      tokenSecret,
      { expiresIn: '30d' }
    );

    res.json({ token, customer });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};


export const registerCustomer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fullName, age, phoneNumber, pinCode, email } = req.body;
    
    if (!fullName || age === undefined || !phoneNumber || !pinCode) {
      res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin đăng ký.' });
      return;
    }

    const cleanFullName = fullName.trim();
    const numAge = Number(age);
    const cleanPhone = phoneNumber.replace(/\s+/g, '').trim();
    const pin = pinCode.trim();

    if (numAge <= 0) {
      res.status(400).json({ message: 'Tuổi phải lớn hơn 0.' });
      return;
    }

    if (!/^\d{6}$/.test(pin)) {
      res.status(400).json({ message: 'Mã PIN phải gồm đúng 6 chữ số.' });
      return;
    }

    // Check phone exist
    const phoneExist = await Customer.findOne({ phoneNumber: cleanPhone });
    if (phoneExist) {
      res.status(400).json({ message: 'Số điện thoại này đã được đăng ký tài khoản.' });
      return;
    }

    // Check email exist if provided
    let cleanEmail = '';
    if (email && email.trim()) {
      cleanEmail = email.trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
        res.status(400).json({ message: 'Định dạng Email không hợp lệ.' });
        return;
      }
      const emailExist = await Customer.findOne({ email: cleanEmail });
      if (emailExist) {
        res.status(400).json({ message: 'Địa chỉ Email này đã được sử dụng.' });
        return;
      }
    }

    // Hash the PIN
    const hashedPin = await bcrypt.hash(pin, 10);

    // If email is provided, generate OTP and send email
    if (cleanEmail) {
      const otp = String(Math.floor(100000 + Math.random() * 900000));
      
      const customer = new Customer({
        fullName: cleanFullName,
        age: numAge,
        phoneNumber: cleanPhone,
        pinCode: hashedPin,
        email: cleanEmail,
        isEmailVerified: false,
        otp,
        points: 1250
      });

      await customer.save();
      await sendVerificationEmail(cleanEmail, otp);
      
      res.status(200).json({
        message: 'OTP_SENT',
        email: cleanEmail
      });
    } else {
      // No email provided, register immediately
      const customer = new Customer({
        fullName: cleanFullName,
        age: numAge,
        phoneNumber: cleanPhone,
        pinCode: hashedPin,
        isEmailVerified: false,
        points: 1250
      });

      const saved = await customer.save();
      
      // Generate token
      const tokenSecret = process.env.JWT_SECRET || 'smartcart-secret-key-123';
      const token = jwt.sign(
        { id: saved._id, phoneNumber: saved.phoneNumber, role: 'customer' },
        tokenSecret,
        { expiresIn: '30d' }
      );

      res.status(211).json({ token, customer: saved }); // Using 211 to indicate direct success without OTP
    }
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const verifyCustomerEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      res.status(400).json({ message: 'Vui lòng cung cấp email và mã OTP.' });
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.trim();

    const customer = await Customer.findOne({ email: cleanEmail });
    if (!customer) {
      res.status(404).json({ message: 'Không tìm thấy tài khoản với email này.' });
      return;
    }

    if (customer.otp !== cleanOtp) {
      res.status(400).json({ message: 'Mã OTP không đúng.' });
      return;
    }

    // Set verified
    customer.isEmailVerified = true;
    customer.otp = undefined;
    const saved = await customer.save();

    // Generate token
    const tokenSecret = process.env.JWT_SECRET || 'smartcart-secret-key-123';
    const token = jwt.sign(
      { id: saved._id, phoneNumber: saved.phoneNumber, role: 'customer' },
      tokenSecret,
      { expiresIn: '30d' }
    );

    res.json({ token, customer: saved });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const updateCustomerPoints = async (req: Request, res: Response): Promise<void> => {
  try {
    const { customerId } = req.params;
    const { points } = req.body;

    const customer = await Customer.findByIdAndUpdate(customerId, { points }, { new: true });
    if (!customer) {
      res.status(404).json({ message: 'Không tìm thấy khách hàng.' });
      return;
    }
    res.json(customer);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const updateCustomerPointsByPhone = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phoneNumber } = req.params;
    const { points } = req.body;

    const customer = await Customer.findOneAndUpdate({ phoneNumber }, { points }, { new: true });
    if (!customer) {
      res.status(404).json({ message: 'Không tìm thấy khách hàng.' });
      return;
    }
    res.json(customer);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};
