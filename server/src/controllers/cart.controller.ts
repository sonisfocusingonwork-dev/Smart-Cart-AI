import { Request, Response } from 'express';
import Cart from '../models/Cart.js';

const INITIAL_CARTS = [
  { id: "C001", name: "Xe đẩy Smart Cart 01", status: "active", battery: 92, lastConnected: "12 giây trước", currentSession: "SS-84920" },
  { id: "C002", name: "Xe đẩy Smart Cart 02", status: "active", battery: 85, lastConnected: "Vừa xong", currentSession: "SS-29402" },
  { id: "C003", name: "Xe đẩy Smart Cart 03", status: "inactive", battery: 45, lastConnected: "2 giờ trước" },
  { id: "C004", name: "Xe đẩy Smart Cart 04", status: "maintenance", battery: 12, lastConnected: "1 ngày trước" },
  { id: "C005", name: "Xe đẩy Smart Cart 05", status: "active", battery: 78, lastConnected: "5 giây trước", currentSession: "SS-91029" },
  { id: "C006", name: "Xe đẩy Smart Cart 06", status: "inactive", battery: 60, lastConnected: "4 giờ trước" },
  { id: "C007", name: "Xe đẩy Smart Cart 07", status: "active", battery: 95, lastConnected: "Vừa xong", currentSession: "SS-12948" },
  { id: "C008", name: "Xe đẩy Smart Cart 08", status: "maintenance", battery: 5, lastConnected: "3 ngày trước" },
  { id: "C009", name: "Xe đẩy Smart Cart 09", status: "active", battery: 89, lastConnected: "8 giây trước", currentSession: "SS-30291" },
  { id: "C010", name: "Xe đẩy Smart Cart 10", status: "inactive", battery: 70, lastConnected: "1 ngày trước" }
];

export const getCarts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page, limit, search, status, batteryLevel, sortBy, sortOrder } = req.query;

    const filterQuery: any = {};

    if (search) {
      const searchRegex = new RegExp(String(search), 'i');
      filterQuery.$or = [
        { id: searchRegex },
        { name: searchRegex },
        { currentZone: searchRegex }
      ];
    }

    if (status && status !== 'all') {
      filterQuery.status = status;
    }

    if (batteryLevel && batteryLevel !== 'all') {
      if (batteryLevel === 'low') {
        filterQuery.battery = { $lte: 15 };
      } else if (batteryLevel === 'medium') {
        filterQuery.battery = { $gt: 15, $lte: 50 };
      } else if (batteryLevel === 'high') {
        filterQuery.battery = { $gt: 50 };
      }
    }

    const sortOptions: any = {};
    if (sortBy) {
      sortOptions[String(sortBy)] = sortOrder === 'desc' ? -1 : 1;
    } else {
      sortOptions.id = 1;
    }

    const cartCount = await Cart.countDocuments(filterQuery);
    if (cartCount === 0 && !search && (!status || status === 'all') && (!batteryLevel || batteryLevel === 'all')) {
      // Seed default carts if collection is completely empty and no filters
      await Cart.insertMany(INITIAL_CARTS);
    }

    if (page) {
      const p = parseInt(String(page), 10) || 1;
      const l = parseInt(String(limit), 10) || 10;
      const skip = (p - 1) * l;

      const total = await Cart.countDocuments(filterQuery);
      const carts = await Cart.find(filterQuery)
        .sort(sortOptions)
        .skip(skip)
        .limit(l)
        .populate('currentCustomer', 'fullName');

      res.status(200).json({
        carts,
        total,
        page: p,
        limit: l
      });
    } else {
      const carts = await Cart.find(filterQuery)
        .sort(sortOptions)
        .populate('currentCustomer', 'fullName');

      res.status(200).json(carts);
    }
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const createCart = async (req: Request, res: Response): Promise<void> => {
  try {
    const newCart = new Cart(req.body);
    const saved = await newCart.save();
    
    const io = req.app.get('io');
    if (io) io.emit('cart-updated');

    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const updateCart = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updated = await Cart.findOneAndUpdate({ id }, req.body, { new: true }).populate('currentCustomer', 'fullName');
    if (!updated) {
      res.status(404).json({ message: `Cart with ID ${id} not found` });
      return;
    }

    const io = req.app.get('io');
    if (io) io.emit('cart-updated');

    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const deleteCart = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deleted = await Cart.findOneAndDelete({ id });
    if (!deleted) {
      res.status(404).json({ message: `Cart with ID ${id} not found` });
      return;
    }

    const io = req.app.get('io');
    if (io) io.emit('cart-updated');

    res.json({ message: 'Cart deleted successfully', deleted });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const assignMockCustomer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { cartId, customerId } = req.body;
    if (!cartId) {
      res.status(400).json({ message: 'cartId là bắt buộc.' });
      return;
    }

    let cart = await Cart.findOne({ id: cartId });
    if (!cart) {
      cart = await Cart.findById(cartId);
    }

    if (!cart) {
      res.status(404).json({ message: 'Không tìm thấy xe đẩy.' });
      return;
    }

    cart.status = 'active';
    cart.currentCustomer = customerId || undefined;
    if (customerId) {
      cart.currentSession = 'SS-MOCK-' + Math.floor(10000 + Math.random() * 90000);
    } else {
      cart.currentSession = undefined;
    }

    const saved = await cart.save();
    const populated = await Cart.findById(saved._id).populate('currentCustomer', 'fullName');

    const io = req.app.get('io');
    if (io) io.emit('cart-updated');

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const bulkUpdateCarts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { cartIds, status } = req.body;
    if (!Array.isArray(cartIds) || !status) {
      res.status(400).json({ message: 'Danh sách cartIds (array) và status là bắt buộc.' });
      return;
    }

    const validStatuses = ['active', 'inactive', 'maintenance'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ message: 'Trạng thái status không hợp lệ.' });
      return;
    }

    const result = await Cart.updateMany(
      { $or: [{ id: { $in: cartIds } }, { _id: { $in: cartIds } }] },
      { $set: { status } }
    );

    const io = req.app.get('io');
    if (io) io.emit('cart-updated');

    res.json({
      message: 'Cập nhật hàng loạt thành công.',
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const exportCarts = async (req: Request, res: Response): Promise<void> => {
  try {
    const carts = await Cart.find().sort({ id: 1 }).populate('currentCustomer', 'fullName');

    let csv = '\uFEFF'; 
    csv += 'Mã xe,Tên thiết bị,Trạng thái,Mức Pin (%),Khu vực,Tọa độ X,Tọa độ Y,Kết nối cuối,Phiên làm việc,Khách hàng sử dụng,Camera,Cân điện tử,Máy quét\n';

    carts.forEach(cart => {
      const statusText = cart.status === 'active' ? 'Đang chạy' : cart.status === 'inactive' ? 'Ngoại tuyến' : 'Bảo trì';
      const customerName = cart.currentCustomer ? (cart.currentCustomer as any).fullName : '-';
      const session = cart.currentSession || '-';
      const cameraStatus = cart.hardwareStatus?.camera === 'Good' ? 'Hoạt động tốt' : 'Lỗi';
      const scaleStatus = cart.hardwareStatus?.scale === 'Good' ? 'Hoạt động tốt' : 'Lỗi';
      const scannerStatus = cart.hardwareStatus?.barcodeScanner === 'Good' ? 'Hoạt động tốt' : 'Lỗi';

      csv += `"${cart.id}","${cart.name}","${statusText}",${cart.battery},"${cart.currentZone}",${cart.coordinates?.x || 0},${cart.coordinates?.y || 0},"${cart.lastConnected}","${session}","${customerName}","${cameraStatus}","${scaleStatus}","${scannerStatus}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=danh_sach_xe_day.csv');
    res.status(200).send(csv);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
