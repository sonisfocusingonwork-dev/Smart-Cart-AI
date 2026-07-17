import { Request, Response } from 'express';
import SecurityAlert from '../models/SecurityAlert.js';

const INITIAL_ALERTS = [
  {
    id: "AL-001",
    cartId: "C001",
    cartName: "Xe đẩy Smart Cart 01",
    time: "23:03:45",
    type: "Lệch cân nặng",
    severity: "high",
    status: "pending",
    details: "Phát hiện chênh lệch trọng lượng +450g so với mặt hàng quét. Cảm biến lực phát hiện bất thường."
  },
  {
    id: "AL-002",
    cartId: "C005",
    cartName: "Xe đẩy Smart Cart 05",
    time: "22:58:10",
    type: "Camera AI phát hiện vật lạ",
    severity: "medium",
    status: "pending",
    details: "AI Camera quét giỏ phát hiện 1 chai rượu vang ngoại chưa quét mã vạch nằm bên góc giỏ."
  },
  {
    id: "AL-003",
    cartId: "C009",
    cartName: "Xe đẩy Smart Cart 09",
    time: "22:50:30",
    type: "Lệch cân nặng",
    severity: "medium",
    status: "resolved",
    details: "Chênh lệch cân nặng -200g. Khách hàng đã lấy lại hàng và cân bằng lại trọng lượng."
  }
];

export const getAlerts = async (req: Request, res: Response): Promise<void> => {
  try {
    let alerts: any[] = await SecurityAlert.find().sort({ time: -1 });
    if (alerts.length === 0) {
      alerts = await SecurityAlert.insertMany(INITIAL_ALERTS);
    }
    res.json(alerts);

  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const createAlert = async (req: Request, res: Response): Promise<void> => {
  try {
    const newAlert = new SecurityAlert(req.body);
    const saved = await newAlert.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const updateAlert = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updated = await SecurityAlert.findOneAndUpdate({ id }, req.body, { new: true });
    if (!updated) {
      res.status(404).json({ message: `Alert with ID ${id} not found` });
      return;
    }
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const deleteAlert = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deleted = await SecurityAlert.findOneAndDelete({ id });
    if (!deleted) {
      res.status(404).json({ message: `Alert with ID ${id} not found` });
      return;
    }
    res.json({ message: 'Alert deleted successfully', deleted });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
