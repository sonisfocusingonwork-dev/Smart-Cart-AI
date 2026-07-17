import mongoose from 'mongoose';
import { seedDatabase } from './config/seed.js';
import Cart from './models/Cart.js';

const MONGODB_URI = 'mongodb://sonisfocusingonwork_db_user:maibennhaubannhe@ac-e3e9xb2-shard-00-00.mdonlfw.mongodb.net:27017,ac-e3e9xb2-shard-00-01.mdonlfw.mongodb.net:27017,ac-e3e9xb2-shard-00-02.mdonlfw.mongodb.net:27017/smartcart?ssl=true&replicaSet=atlas-vynmgm-shard-0&authSource=admin';

mongoose.connect(MONGODB_URI)
  .then(() => Cart.deleteMany({}))
  .then(() => seedDatabase())
  .then(() => {
    console.log('Reseeded carts with new logic');
    setTimeout(() => process.exit(0), 1000);
  });
