import { Request, Response } from 'express';
import Product from '../models/Product.js';
import Cart from '../models/Cart.js';
import SecurityAlert from '../models/SecurityAlert.js';

export const getDashboardOverview = async (req: Request, res: Response): Promise<void> => {
  try {
    // 1. Get total counts
    const totalProductsCount = await Product.countDocuments();
    const pendingAlertsCount = await SecurityAlert.countDocuments({ status: 'pending' });
    
    // 2. Sum data by Category for the Bar Chart
    const products = await Product.find();
    
    const categories: Record<string, { name: string; revenue: number; quantity: number }> = {
      "Hàng tươi sống": { name: "Hàng tươi sống", revenue: 0, quantity: 0 },
      "Thực phẩm khô & đồ uống": { name: "Khô & Đồ uống", revenue: 0, quantity: 0 },
      "Đông lạnh": { name: "Đông lạnh", revenue: 0, quantity: 0 }
    };

    products.forEach(p => {
      const catName = p.category;
      if (categories[catName]) {
        categories[catName].revenue += p.revenue;
        categories[catName].quantity += p.quantity;
      } else {
        // Fallback for ad-hoc category names
        categories[catName] = { name: catName, revenue: p.revenue, quantity: p.quantity };
      }
    });

    const barChartData = Object.values(categories);

    // 3. Donut chart data for Cart status
    const carts = await Cart.find();
    const cartStatuses = {
      active: { name: "Đang hoạt động", value: 0, color: "#10B981" },
      inactive: { name: "Không hoạt động", value: 0, color: "#64748B" },
      maintenance: { name: "Đang bảo trì", value: 0, color: "#EF4444" }
    };

    carts.forEach(c => {
      if (cartStatuses[c.status]) {
        cartStatuses[c.status].value++;
      }
    });

    const donutChartData = Object.values(cartStatuses);

    // 4. Calculate total revenue sum
    const totalRevenue = products.reduce((sum, p) => sum + p.revenue, 0);

    res.json({
      totalProductsCount,
      pendingAlertsCount,
      totalRevenue,
      barChartData,
      donutChartData
    });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const getCategoryPieData = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category } = req.query;
    if (!category) {
      res.status(400).json({ message: 'Category parameter is required' });
      return;
    }

    const products = await Product.find({ category: category as string });
    
    const subCategories: Record<string, number> = {};
    const colors = ["#EF4444", "#3B82F6", "#10B981", "#F59E0B", "#EC4899", "#8B5CF6"];

    products.forEach(p => {
      subCategories[p.subCategory] = (subCategories[p.subCategory] || 0) + p.revenue;
    });

    const pieChartData = Object.keys(subCategories).map((name, index) => ({
      name,
      value: subCategories[name],
      color: colors[index % colors.length]
    }));

    res.json(pieChartData);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
