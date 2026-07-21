import { Request, Response } from 'express';
import Order from '../models/Order.js';
import Product from '../models/Product.js';

const INITIAL_ORDERS = [
  {
    id: "SC-260706-1842",
    completedAt: "2026-07-06T18:42:00+07:00",
    store: "Smart Market · Quận Bình Thạnh",
    paymentMethod: "Ví điện tử MoMo",
    items: [
      { name: "Thịt Bò Úc 500g", qty: 1, price: 100000 },
      { name: "Gạo ST25 5kg", qty: 1, price: 145000 },
      { name: "Coca-Cola 330ml", qty: 4, price: 10000 }
    ],
    discount: 25000,
    total: 268000,
    pointsEarned: 27
  },
  {
    id: "SC-260628-0956",
    completedAt: "2026-06-28T09:56:00+07:00",
    store: "Smart Market · Quận 1",
    paymentMethod: "Thẻ ngân hàng",
    items: [
      { name: "Sữa Tươi Vinamilk 1L", qty: 2, price: 36000 },
      { name: "Táo Fuji Nam Phi", qty: 1, price: 85000 },
      { name: "Khăn giấy cuộn lớn", qty: 1, price: 42000 }
    ],
    discount: 15000,
    total: 184000,
    pointsEarned: 18
  },
  {
    id: "SC-260615-2014",
    completedAt: "2026-06-15T20:14:00+07:00",
    store: "Smart Market · Quận Bình Thạnh",
    paymentMethod: "QR ngân hàng",
    items: [
      { name: "Cá Hồi Tươi 300g", qty: 1, price: 180000 },
      { name: "Dầu ăn Simply 1L", qty: 1, price: 62000 },
      { name: "Nước mắm Nam Ngư", qty: 1, price: 45000 }
    ],
    discount: 30000,
    total: 266000,
    pointsEarned: 27
  },
  {
    id: "SC-260530-1648",
    completedAt: "2026-05-30T16:48:00+07:00",
    store: "Smart Market · Quận 3",
    paymentMethod: "Ví SmartPay",
    items: [
      { name: "Tã dán Huggies L", qty: 1, price: 280000 },
      { name: "Sữa Tươi Vinamilk 1L", qty: 2, price: 36000 },
      { name: "Nước suối Aquafina 500ml", qty: 6, price: 6000 }
    ],
    discount: 40000,
    total: 348000,
    pointsEarned: 35
  },
  {
    id: "SC-260511-1132",
    completedAt: "2026-05-11T11:32:00+07:00",
    store: "Smart Market · Quận Bình Thạnh",
    paymentMethod: "Tiền mặt tại quầy",
    items: [
      { name: "Mì Gói Hảo Hảo", qty: 10, price: 4000 },
      { name: "Hạt Nêm Knorr", qty: 2, price: 32000 },
      { name: "Dầu gội Clear 650ml", qty: 1, price: 120000 }
    ],
    discount: 15000,
    total: 209000,
    pointsEarned: 21
  },
  {
    id: "SC-260427-1907",
    completedAt: "2026-04-27T19:07:00+07:00",
    store: "Smart Market · Quận 1",
    paymentMethod: "Thẻ ngân hàng",
    items: [
      { name: "Nước rửa chén Sunlight", qty: 2, price: 25000 },
      { name: "Kem đánh răng Closeup", qty: 2, price: 38000 },
      { name: "Hạt Điều Rang Muối", qty: 1, price: 75000 }
    ],
    discount: 20000,
    total: 181000,
    pointsEarned: 18
  }
];

export const getOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    let orders = await Order.find().sort({ completedAt: -1 });
    if (orders.length === 0) {
      orders = await Order.insertMany(INITIAL_ORDERS);
    }
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const createOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { items, customerId, memberCustomerIds, groupSessionCode, ...orderData } = req.body;
    
    // Strict POS validation logic:
    // Only one customerId is allowed (the owner's)
    let posCustomerId = customerId;
    if (memberCustomerIds && memberCustomerIds.length > 0) {
      if (customerId) {
        // Log conflict
        console.warn(`[POS SYNC] Multiple accounts detected in group ${groupSessionCode}. Stripping member IDs...`);
      }
    }

    // 1. Pre-validation: Check stock BEFORE saving the order
    if (items && Array.isArray(items)) {
      for (const item of items) {
        // Look up by name since FE currently only passes name and a generated cart id
        const product = await Product.findOne({ name: item.name }); 
        if (!product) {
          res.status(404).json({ message: `Sản phẩm không tồn tại: ${item.name}` });
          return;
        }
        if (product.stockLevel < item.qty) {
          res.status(400).json({ message: `Sản phẩm "${item.name}" không đủ số lượng trong kho.` });
          return;
        }
      }
    }

    const newOrder = new Order({
      ...orderData,
      items,
      customerId: posCustomerId
    });
    const saved = await newOrder.save();

    // 2. Safe Deduction
    if (saved.items && Array.isArray(saved.items)) {
      for (const item of saved.items) {
        // Use updateOne to avoid full document validation (e.g. missing barcode on older mock products)
        const product = await Product.findOne({ name: item.name });
        if (product) {
          const newStockLevel = product.stockLevel - item.qty;
          await Product.updateOne(
            { _id: product._id },
            {
              $inc: {
                stockLevel: -item.qty,
                quantity: item.qty,
                revenue: item.price * item.qty
              },
              $set: {
                lowStockAlert: newStockLevel < 10
              }
            }
          );
        }
      }
    }

    const io = req.app.get('io');
    if (io) {
      io.emit('inventory-updated');
    }

    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};
