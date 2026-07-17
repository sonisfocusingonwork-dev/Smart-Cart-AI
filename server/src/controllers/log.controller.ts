import { Request, Response } from 'express';
import SystemLog from '../models/SystemLog.js';

const INITIAL_LOGS = [
  { time: "23:04:12", msg: "Camera AI Kệ 04 kết nối thành công.", type: "info" },
  { time: "22:58:45", msg: "Cân điện tử Xe_01 đã được căn chuẩn (Calibrated).", type: "success" },
  { time: "22:15:30", msg: "Cảnh báo: Pin Xe đẩy Smart Cart 08 xuống dưới 10% (Còn 5%).", type: "warning" },
  { time: "21:40:12", msg: "Đã ngắt phiên mua sắm SS-49102 của khách hàng vãng lai.", type: "info" },
  { time: "21:05:00", msg: "Xe đẩy Smart Cart 04 chuyển trạng thái sang [Bảo Trì] do lỗi cảm biến bánh xe.", type: "danger" }
];

export const getLogs = async (req: Request, res: Response): Promise<void> => {
  try {
    let logs: any[] = await SystemLog.find().sort({ createdAt: -1 }).limit(100);
    if (logs.length === 0) {
      logs = await SystemLog.insertMany(INITIAL_LOGS);
      // Sort again after inserting
      logs = await SystemLog.find().sort({ createdAt: -1 }).limit(100);
    }
    res.json(logs);

  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const createLog = async (req: Request, res: Response): Promise<void> => {
  try {
    const newLog = new SystemLog(req.body);
    const saved = await newLog.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};
