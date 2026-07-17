import { Request, Response } from 'express';
import SystemSettings from '../models/SystemSettings.js';

export const getSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = new SystemSettings();
      await settings.save();
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const updateSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const settings = await SystemSettings.findOneAndUpdate({}, req.body, { new: true, upsert: true });
    res.json(settings);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};
