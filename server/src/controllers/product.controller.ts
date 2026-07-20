import { Request, Response } from 'express';
import Product from '../models/Product.js';

// Initial products moved to seedProducts.ts

export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category } = req.query;
    const filter = category ? { category: category as string } : {};
    let products = await Product.find(filter).sort({ id: 1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { barcode } = req.body;
    if (barcode) {
      const existing = await Product.findOne({ barcode });
      if (existing) {
        res.status(400).json({ message: 'Mã barcode này đã tồn tại trong hệ thống.' });
        return;
      }
    }
    const newProduct = new Product(req.body);
    const saved = await newProduct.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { barcode } = req.body;
    
    if (barcode) {
      const existing = await Product.findOne({ barcode });
      if (existing && existing.id !== id) {
        res.status(400).json({ message: 'Mã barcode này đã tồn tại trong hệ thống.' });
        return;
      }
    }

    const updated = await Product.findOneAndUpdate({ id }, req.body, { new: true });
    if (!updated) {
      res.status(404).json({ message: `Product with ID ${id} not found` });
      return;
    }
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deleted = await Product.findOneAndDelete({ id });
    if (!deleted) {
      res.status(404).json({ message: `Product with ID ${id} not found` });
      return;
    }
    res.json({ message: 'Product deleted successfully', deleted });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const getLowStockProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const products = await Product.find({ lowStockAlert: true }).sort({ quantity: 1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
