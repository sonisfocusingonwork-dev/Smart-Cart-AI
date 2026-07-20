import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import Admin from '../models/Admin.js';

export const getStaff = async (req: Request, res: Response): Promise<void> => {
  try {
    const staffList = await Admin.find().populate('branchId', 'name address').select('-pinCode');
    res.json(staffList);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const createStaff = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, phoneNumber, pinCode, role, branchId } = req.body;
    
    const existing = await Admin.findOne({ phoneNumber });
    if (existing) {
      res.status(400).json({ message: 'Số điện thoại đã tồn tại' });
      return;
    }

    const hashedPin = await bcrypt.hash(pinCode, 10);
    const newStaff = new Admin({
      name,
      phoneNumber,
      pinCode: hashedPin,
      role,
      branchId: branchId || null
    });
    
    await newStaff.save();
    
    const savedStaff = await Admin.findById(newStaff._id).populate('branchId', 'name').select('-pinCode');
    res.status(201).json(savedStaff);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const updateStaff = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, phoneNumber, pinCode, role, branchId } = req.body;

    const staff = await Admin.findById(id);
    if (!staff) {
      res.status(404).json({ message: 'Không tìm thấy nhân viên' });
      return;
    }

    if (phoneNumber && phoneNumber !== staff.phoneNumber) {
      const existing = await Admin.findOne({ phoneNumber });
      if (existing) {
        res.status(400).json({ message: 'Số điện thoại đã tồn tại' });
        return;
      }
      staff.phoneNumber = phoneNumber;
    }

    if (name) staff.name = name;
    if (role) staff.role = role;
    if (branchId !== undefined) staff.branchId = branchId;
    if (pinCode) {
      staff.pinCode = await bcrypt.hash(pinCode, 10);
    }

    await staff.save();
    
    const updatedStaff = await Admin.findById(id).populate('branchId', 'name').select('-pinCode');
    res.json(updatedStaff);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const deleteStaff = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const staff = await Admin.findByIdAndDelete(id);
    if (!staff) {
      res.status(404).json({ message: 'Không tìm thấy nhân viên' });
      return;
    }
    res.json({ message: 'Xóa nhân viên thành công' });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
