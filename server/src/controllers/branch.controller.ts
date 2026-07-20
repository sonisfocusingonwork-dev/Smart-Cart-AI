import { Request, Response } from 'express';
import Branch from '../models/Branch.js';

export const getBranches = async (req: Request, res: Response): Promise<void> => {
  try {
    const branches = await Branch.find();
    res.json(branches);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const createBranch = async (req: Request, res: Response): Promise<void> => {
  try {
    const branch = new Branch(req.body);
    const savedBranch = await branch.save();
    res.status(201).json(savedBranch);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const updateBranch = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const branch = await Branch.findByIdAndUpdate(id, req.body, { new: true });
    if (!branch) {
      res.status(404).json({ message: 'Không tìm thấy chi nhánh' });
      return;
    }
    res.json(branch);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const deleteBranch = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const branch = await Branch.findByIdAndDelete(id);
    if (!branch) {
      res.status(404).json({ message: 'Không tìm thấy chi nhánh' });
      return;
    }
    res.json({ message: 'Đã xóa chi nhánh' });
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};
