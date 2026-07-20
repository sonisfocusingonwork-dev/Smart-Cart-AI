import bcrypt from 'bcryptjs';
import Product from '../models/Product.js';
import Cart from '../models/Cart.js';
import SecurityAlert from '../models/SecurityAlert.js';
import Order from '../models/Order.js';
import SystemLog from '../models/SystemLog.js';
import Admin from '../models/Admin.js';
import Customer from '../models/Customer.js';


const INITIAL_PRODUCTS = [
  { id: "P001", name: "Thịt Bò Úc 500g", category: "Hàng tươi sống", subCategory: "Thịt tươi", price: 120000, quantity: 150, revenue: 18000000, stockLevel: 45 },
  { id: "P002", name: "Cá Hồi Fillet 300g", category: "Hàng tươi sống", subCategory: "Hải sản", price: 180000, quantity: 80, revenue: 14400000, stockLevel: 12 },
  { id: "P003", name: "Rau Củ Hỗn Hợp Đà Lạt", category: "Hàng tươi sống", subCategory: "Rau củ quả", price: 35000, quantity: 300, revenue: 10500000, stockLevel: 80 },
  { id: "P004", name: "Trứng Gà Omega-3 (Hộp 10)", category: "Hàng tươi sống", subCategory: "Trứng & Bơ sữa", price: 45000, quantity: 200, revenue: 9000000, stockLevel: 5 },
  { id: "P005", name: "Mì Ăn Liền Hảo Hảo Tôm Chua Cay", category: "Thực phẩm khô & đồ uống", subCategory: "Mì & Đồ đóng hộp", price: 4500, quantity: 1500, revenue: 6750000, stockLevel: 300 },
  { id: "P006", name: "Sữa Tươi Tiệt Trùng Vinamilk 1L", category: "Thực phẩm khô & đồ uống", subCategory: "Sữa & sản phẩm sữa", price: 36000, quantity: 600, revenue: 21600000, stockLevel: 50 },
  { id: "P007", name: "Nước Ngọt Coca-Cola Lon 320ml", category: "Thực phẩm khô & đồ uống", subCategory: "Nước giải khát", price: 11000, quantity: 1200, revenue: 13200000, stockLevel: 120 },
  { id: "P008", name: "Kem Hộp Merino Socola 400ml", category: "Đông lạnh", subCategory: "Kem & Tráng miệng", price: 65000, quantity: 120, revenue: 7800000, stockLevel: 8 },
  { id: "P009", name: "Há Cảo Tôm Thịt Cầu Tre 500g", category: "Đông lạnh", subCategory: "Thực phẩm đông lạnh chế biến", price: 85000, quantity: 250, revenue: 21250000, stockLevel: 40 },
  { id: "P010", name: "Mực Ống Cắt Khoanh Đông Lạnh", category: "Đông lạnh", subCategory: "Hải sản đông lạnh", price: 110000, quantity: 180, revenue: 19800000, stockLevel: 25 }
];

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
  { id: "C010", name: "Xe đẩy Smart Cart 10", status: "inactive", battery: 70, lastConnected: "1 ngày trước" },
  { id: "C011", name: "Xe đẩy Smart Cart 11", status: "active", battery: 88, lastConnected: "Vừa xong", currentSession: "SS-11111" },
  { id: "C012", name: "Xe đẩy Smart Cart 12", status: "inactive", battery: 55, lastConnected: "3 giờ trước" },
  { id: "C013", name: "Xe đẩy Smart Cart 13", status: "active", battery: 99, lastConnected: "3 giây trước", currentSession: "SS-13131" },
  { id: "C014", name: "Xe đẩy Smart Cart 14", status: "maintenance", battery: 8, lastConnected: "12 giờ trước" },
  { id: "C015", name: "Xe đẩy Smart Cart 15", status: "active", battery: 65, lastConnected: "1 phút trước", currentSession: "SS-15151" },
  { id: "C016", name: "Xe đẩy Smart Cart 16", status: "inactive", battery: 42, lastConnected: "5 giờ trước" },
  { id: "C017", name: "Xe đẩy Smart Cart 17", status: "active", battery: 70, lastConnected: "15 giây trước", currentSession: "SS-17171" },
  { id: "C018", name: "Xe đẩy Smart Cart 18", status: "inactive", battery: 80, lastConnected: "2 ngày trước" },
  { id: "C019", name: "Xe đẩy Smart Cart 19", status: "active", battery: 90, lastConnected: "Vừa xong", currentSession: "SS-19191" },
  { id: "C020", name: "Xe đẩy Smart Cart 20", status: "maintenance", battery: 20, lastConnected: "2 giờ trước" },
  { id: "C021", name: "Xe đẩy Smart Cart 21", status: "active", battery: 82, lastConnected: "10 giây trước", currentSession: "SS-21212" },
  { id: "C022", name: "Xe đẩy Smart Cart 22", status: "inactive", battery: 38, lastConnected: "1 ngày trước" },
  { id: "C023", name: "Xe đẩy Smart Cart 23", status: "active", battery: 94, lastConnected: "Vừa xong", currentSession: "SS-23232" },
  { id: "C024", name: "Xe đẩy Smart Cart 24", status: "maintenance", battery: 15, lastConnected: "5 giờ trước" },
  { id: "C025", name: "Xe đẩy Smart Cart 25", status: "active", battery: 75, lastConnected: "45 giây trước", currentSession: "SS-25252" },
  { id: "C026", name: "Xe đẩy Smart Cart 26", status: "inactive", battery: 50, lastConnected: "6 giờ trước" },
  { id: "C027", name: "Xe đẩy Smart Cart 27", status: "active", battery: 87, lastConnected: "2 giây trước", currentSession: "SS-27272" },
  { id: "C028", name: "Xe đẩy Smart Cart 28", status: "maintenance", battery: 3, lastConnected: "4 ngày trước" },
  { id: "C029", name: "Xe đẩy Smart Cart 29", status: "active", battery: 91, lastConnected: "Vừa xong", currentSession: "SS-29292" },
  { id: "C030", name: "Xe đẩy Smart Cart 30", status: "inactive", battery: 67, lastConnected: "3 giờ trước" },
  { id: "C031", name: "Xe đẩy Smart Cart 31", status: "active", battery: 84, lastConnected: "5 giây trước", currentSession: "SS-31313" },
  { id: "C032", name: "Xe đẩy Smart Cart 32", status: "inactive", battery: 72, lastConnected: "1 ngày trước" },
  { id: "C033", name: "Xe đẩy Smart Cart 33", status: "active", battery: 96, lastConnected: "Vừa xong", currentSession: "SS-33333" },
  { id: "C034", name: "Xe đẩy Smart Cart 34", status: "maintenance", battery: 10, lastConnected: "12 giờ trước" },
  { id: "C035", name: "Xe đẩy Smart Cart 35", status: "active", battery: 60, lastConnected: "1 phút trước", currentSession: "SS-35353" }
];

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
  }
];

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
  }
];

const INITIAL_LOGS = [
  { time: "23:04:12", msg: "Camera AI Kệ 04 kết nối thành công.", type: "info" },
  { time: "22:58:45", msg: "Cân điện tử Xe_01 đã được căn chuẩn (Calibrated).", type: "success" }
];

const INITIAL_ADMINS = [
  { phoneNumber: '0987654321', pinCode: '654321', name: 'Hệ thống Root Admin', role: 'admin' },
  { phoneNumber: '0988888888', pinCode: '888888', name: 'Son Nguyen', role: 'admin' }
];

export const seedDatabase = async (): Promise<void> => {
  try {
    console.log('Checking database status to seed initial records...');

    const prodCount = await Product.countDocuments();
    if (prodCount === 0) {
      await Product.insertMany(INITIAL_PRODUCTS);
      console.log('Seeded products into database.');
    }

    const cartCount = await Cart.countDocuments();
    if (cartCount === 0) {
      const zones = ['Aisle 1', 'Aisle 2', 'Aisle 3', 'Produce', 'Bakery', 'Checkout'];
      
      const cartsWithIoT = INITIAL_CARTS.map((cart, index) => {
        const pseudoRandom = (seed: number) => {
          const val = Math.sin(seed * 12.9898) * 43758.5453;
          return val - Math.floor(val);
        };
        
        let status = cart.status;
        // Giảm số lượng xe hiển thị: chuyển bớt các xe active thành inactive để map gọn hơn
        if (status === 'active' && pseudoRandom(index + 10) > 0.4) {
          status = 'inactive';
        }

        const isMaintenance = status === 'maintenance';
        const errorComponent = index % 3;

        // Đồng bộ tọa độ theo khu vực (Zone)
        const zones = ['Aisle 1', 'Aisle 2', 'Aisle 3', 'Produce', 'Bakery', 'Checkout'];
        const currentZone = zones[index % zones.length];
        
        let x = 100;
        let y = 100;

        switch (currentZone) {
          case 'Produce': // Hàng tươi sống: X: 390-950, Y: 150-200
            x = 390 + Math.floor(pseudoRandom(index + 1) * 560);
            y = 150 + Math.floor(pseudoRandom(index + 2) * 50);
            break;
          case 'Aisle 1': // Mì, gạo: X: 390-600, Y: 280-320
            x = 390 + Math.floor(pseudoRandom(index + 1) * 210);
            y = 280 + Math.floor(pseudoRandom(index + 2) * 40);
            break;
          case 'Aisle 2': // Đồ uống: X: 390-850, Y: 420-460
            x = 390 + Math.floor(pseudoRandom(index + 1) * 460);
            y = 420 + Math.floor(pseudoRandom(index + 2) * 40);
            break;
          case 'Aisle 3': // Gia dụng: X: 390-850, Y: 560-600
            x = 390 + Math.floor(pseudoRandom(index + 1) * 460);
            y = 560 + Math.floor(pseudoRandom(index + 2) * 40);
            break;
          case 'Checkout': // Thu ngân: X: 950-1100, Y: 500-600
            x = 950 + Math.floor(pseudoRandom(index + 1) * 150);
            y = 500 + Math.floor(pseudoRandom(index + 2) * 100);
            break;
          case 'Bakery': // Đông lạnh (tủ mát, kho lạnh): X: 1000-1150, Y: 180-350
            x = 1000 + Math.floor(pseudoRandom(index + 1) * 150);
            y = 180 + Math.floor(pseudoRandom(index + 2) * 170);
            break;
        }

        return {
          ...cart,
          status,
          batteryLevel: cart.battery,
          currentZone,
          coordinates: { x, y },
          hardwareStatus: {
            camera: isMaintenance && errorComponent === 0 ? 'Error' : 'Good',
            scale: isMaintenance && errorComponent === 1 ? 'Error' : 'Good',
            barcodeScanner: isMaintenance && errorComponent === 2 ? 'Error' : 'Good'
          }
        };
      });

      await Cart.insertMany(cartsWithIoT);
      console.log('Seeded carts into database with IoT properties.');
    }

    const alertCount = await SecurityAlert.countDocuments();
    if (alertCount === 0) {
      await SecurityAlert.insertMany(INITIAL_ALERTS);
      console.log('Seeded security alerts into database.');
    }

    const orderCount = await Order.countDocuments();
    if (orderCount === 0) {
      await Order.insertMany(INITIAL_ORDERS);
      console.log('Seeded orders into database.');
    }

    const logCount = await SystemLog.countDocuments();
    if (logCount === 0) {
      await SystemLog.insertMany(INITIAL_LOGS);
      console.log('Seeded system logs into database.');
    }

    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      const hashedAdmins = await Promise.all(INITIAL_ADMINS.map(async (adm) => {
        const hashedPassword = await bcrypt.hash(adm.pinCode, 10);
        return {
          ...adm,
          pinCode: hashedPassword
        };
      }));
      await Admin.insertMany(hashedAdmins);
      console.log('Seeded admin accounts into database with hashed passwords.');
    }

    const customerCount = await Customer.countDocuments();
    if (customerCount === 0) {
      const INITIAL_CUSTOMERS = [
        { fullName: 'Nguyễn Văn A', age: 25, phoneNumber: '0912345678', pinCode: '111111', email: 'nva@example.com', isEmailVerified: true, points: 1250 },
        { fullName: 'Sơn Nguyễn', age: 30, phoneNumber: '0988888888', pinCode: '222222', email: 'son@example.com', isEmailVerified: true, points: 2500 },
        { fullName: 'Trần Thị B', age: 22, phoneNumber: '0901234567', pinCode: '333333', points: 800 }
      ];
      const hashedCustomers = await Promise.all(INITIAL_CUSTOMERS.map(async (c) => {
        const hashedPin = await bcrypt.hash(c.pinCode, 10);
        return {
          ...c,
          pinCode: hashedPin
        };
      }));
      await Customer.insertMany(hashedCustomers);
      console.log('Seeded initial customer accounts into database.');
    }

    // Assign a customer to a cart for testing
    const aCart = await Cart.findOne({ id: "C001" });
    const aCustomer = await Customer.findOne({ phoneNumber: "0912345678" });
    if (aCart && aCustomer) {
      aCart.currentCustomer = aCustomer._id as any;
      aCart.status = "active";
      await aCart.save();
      console.log('Assigned customer Nguyễn Văn A to Cart C001 for test visualization.');
    }

    console.log('Database seeding status check complete.');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};
