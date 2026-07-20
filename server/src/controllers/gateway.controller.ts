import { Request, Response } from 'express';
import GatewayLog from '../models/GatewayLog.js';
import Order from '../models/Order.js';

export const submitGatewayLog = async (req: Request, res: Response): Promise<void> => {
  try {
    const { cartId, staffName, status, reason } = req.body;
    const newLog = new GatewayLog({
      cartId,
      staffName,
      status,
      reason
    });
    await newLog.save();
    res.status(201).json(newLog);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const getGatewayLogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const logs = await GatewayLog.find().sort({ createdAt: -1 }).limit(50);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const getDashboardData = async (req: Request, res: Response): Promise<void> => {
  try {
    const logs = await GatewayLog.find().sort({ createdAt: -1 }).limit(100);
    
    // Calculate stats
    const totalChecks = logs.length;
    const passCount = logs.filter(l => l.status === 'pass').length;
    const holdCount = logs.filter(l => l.status === 'hold').length;
    const successRate = totalChecks === 0 ? 100 : Math.round((passCount / totalChecks) * 100 * 10) / 10;
    
    // Fetch related orders
    const cartIds = logs.map(l => l.cartId);
    const orders = await Order.find({ id: { $in: cartIds } });
    
    // Create a map for quick lookup
    const orderMap = new Map();
    for (const o of orders) {
      orderMap.set(o.id, o);
    }
    
    const history = logs.map(log => {
      const order = orderMap.get(log.cartId);
      if (order) {
        return {
          cartId: "Xe chính (Real)",
          invoiceCode: order.id,
          customerPhone: "Thành viên",
          paymentMethod: order.paymentMethod || "Tiền mặt",
          items: order.items.map((item: any) => ({
            name: item.name,
            qty: item.qty,
            price: item.price,
            aiVerified: true
          })),
          status: log.status,
          timestamp: log.createdAt.toISOString(),
          handledBy: log.staffName,
          total: order.total,
          discount: order.discount,
          tax: order.tax,
          appliedVoucherCode: order.appliedVoucherCode
        };
      } else {
        // Fallback for demo logs or deleted orders
        return {
          cartId: log.cartId,
          invoiceCode: log.cartId,
          customerPhone: "Unknown",
          paymentMethod: "Unknown",
          items: [],
          status: log.status,
          timestamp: log.createdAt.toISOString(),
          handledBy: log.staffName,
          total: 0,
          discount: 0,
          tax: 0
        };
      }
    });
    
    res.json({
      stats: {
        totalChecks,
        passCount,
        holdCount,
        successRate,
        avgSpeed: "8s" // Placeholder metric
      },
      history
    });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const getCartPayload = async (req: Request, res: Response): Promise<void> => {
  try {
    const { cartId } = req.params;
    
    if (cartId === 'Cart_DEMO') {
      const payload = {
        cartHistory: {
          cartId: cartId,
          invoiceCode: `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}A`,
          customerPhone: "0987***321",
          paymentMethod: "ZaloPay",
          items: [
            { name: "Sữa tươi Vinamilk 1L", qty: 2, price: 35000, aiVerified: true },
            { name: "Bánh mì gối lúa mạch", qty: 1, price: 25000, aiVerified: true },
            { name: "Thịt heo ba chỉ 500g", qty: 1, price: 85000, aiVerified: false },
            { name: "Cà chua Cherry 300g", qty: 2, price: 45000, aiVerified: true }
          ],
          status: "paid",
          timestamp: new Date().toISOString(),
          total: 270000
        },
        gateSnapshot: {
          imageUrl: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?q=80&w=1000&auto=format&fit=crop",
          timestamp: new Date().toISOString(),
          cartId: cartId,
          aiAnomalies: [
            { x: 45, y: 60, width: 25, height: 20, label: "Thịt heo ba chỉ (Không khớp số lượng)" }
          ]
        }
      };
      res.json(payload);
      return;
    }

    // Lookup real order
    const order = await Order.findOne({ id: cartId });
    if (!order) {
      res.status(404).json({ message: "Không tìm thấy dữ liệu hóa đơn này." });
      return;
    }

    const payload = {
      cartHistory: {
        cartId: "Xe chính (Real)",
        invoiceCode: order.id,
        customerPhone: "Thành viên",
        paymentMethod: order.paymentMethod || "Tiền mặt",
        items: order.items.map(item => ({
          name: item.name,
          qty: item.qty,
          price: item.price,
          aiVerified: true
        })),
        status: "paid",
        timestamp: order.completedAt || new Date().toISOString(),
        total: order.total,
        discount: order.discount,
        tax: order.tax,
        appliedVoucherCode: order.appliedVoucherCode
      },
      gateSnapshot: {
        imageUrl: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?q=80&w=1000&auto=format&fit=crop",
        timestamp: new Date().toISOString(),
        cartId: "Xe chính (Real)",
        aiAnomalies: []
      }
    };

    res.json(payload);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
