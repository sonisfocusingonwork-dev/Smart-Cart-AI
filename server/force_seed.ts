import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, './.env') });

import { seedDatabase } from './src/config/seed.js';
import Cart from './src/models/Cart.js';
import Product from './src/models/Product.js';

const uri = process.env.MONGODB_URI;
mongoose.connect(uri).then(async () => {
  await Cart.deleteMany({});
  await Product.deleteMany({});
  console.log('Cleared Carts and Products');
  await seedDatabase();
  console.log('Force Reseeded');
  process.exit(0);
});
