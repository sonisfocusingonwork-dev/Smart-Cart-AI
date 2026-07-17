import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import { connectDB } from './config/db.js';

// Import các routes
import productRoutes from './routes/product.routes.js';
import cartRoutes from './routes/cart.routes.js';
import alertRoutes from './routes/alert.routes.js';
import orderRoutes from './routes/order.routes.js';
import groupRoutes from './routes/group.routes.js';
import logRoutes from './routes/log.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import adminRoutes from './routes/admin.routes.js';
import customerRoutes from './routes/customer.routes.js';
import staffRoutes from './routes/staff.routes.js';
import branchRoutes from './routes/branch.routes.js';
import settingsRoutes from './routes/settings.routes.js';
import ticketRoutes from './routes/ticket.routes.js';

import { seedDatabase } from './config/seed.js';

dotenv.config();

// Kết nối cơ sở dữ liệu MongoDB và thực hiện seeding dữ liệu ban đầu
const initApp = async () => {
  await connectDB();
  await seedDatabase();
};
initApp();

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

app.set('io', io);
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Đăng ký endpoints API
app.use('/api/products', productRoutes);
app.use('/api/carts', cartRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/group-sessions', groupRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/tickets', ticketRoutes);

// API kiểm tra trạng thái
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Smart Shopping Cart Server is running',
    timestamp: new Date().toISOString()
  });
});

import SupportTicket from './models/SupportTicket.js';

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('new-support-ticket', async (data) => {
    try {
      // data: { cartId, issueType, locationZone }
      const newTicket = new SupportTicket({
        cartId: data.cartId,
        issueType: data.issueType,
        locationZone: data.locationZone,
        status: 'open'
      });
      const savedTicket = await newTicket.save();
      // Broadcast to all admin dashboards
      io.emit('admin-new-ticket', savedTicket);
    } catch (err) {
      console.error('Error saving support ticket:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
