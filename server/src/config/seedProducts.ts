import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';

dotenv.config();

const dbURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smartcart';

const generateBarcode = (index: number, catPrefix: string) => {
  return `${catPrefix}${String(index).padStart(6, '0')}${Math.floor(Math.random() * 10)}`;
};

const getRandomCoord = (min: number, max: number) => {
  return parseFloat((Math.random() * (max - min) + min).toFixed(2));
};

const categoryData = [
  {
    category: "Hàng tươi sống",
    prefix: "893FRE",
    xRange: [0, 20],
    yRange: [0, 20],
    items: [
      "Thịt Bò Úc Nhập Khẩu 500g", "Cá Hồi Nauy Tươi 300g", "Rau Cải Ngọt Organic 500g", "Trứng Gà Ta (Vỉ 10 quả)", "Cà Chua Bi Đà Lạt 250g",
      "Nho Xanh Không Hạt Mỹ 1kg", "Thịt Ba Chỉ Heo CP 500g", "Tôm Sú Cà Mau 500g", "Cá Ngừ Đại Dương 400g", "Cam Sành Vĩnh Long 1kg"
    ]
  },
  {
    category: "Thực phẩm khô & đồ uống",
    prefix: "893DRY",
    xRange: [30, 50],
    yRange: [0, 20],
    items: [
      "Mì tôm Hảo Hảo Tôm Chua Cay", "Nước giải khát Coca Cola 330ml", "Gạo ST25 5kg", "Sữa tươi Vinamilk 100% 1L", "Cà phê G7 3in1",
      "Trà Ô Long Tea+ 455ml", "Snack Khoai Tây Lay's 105g", "Bánh ChocoPie (Hộp 12 cái)", "Bia Tiger Lon 330ml", "Nước yến sào Sanest"
    ]
  },
  {
    category: "Đông lạnh",
    prefix: "893FRO",
    xRange: [0, 20],
    yRange: [80, 100],
    items: [
      "Xúc Xích Đức Việt 500g", "Há Cảo Tôm Thịt Cầu Tre 500g", "Kem Merino Socola 400ml", "Chả Giò Rế Vissan 500g", "Bò Viên Gân 500g",
      "Phô Mai Mozzarella 200g", "Bánh Bao Nhân Đậu Xanh", "Khoai Tây Chiên Sẵn 1kg", "Cá Viên Chiên 500g", "Pizza Đông Lạnh Hải Sản"
    ]
  },
  {
    category: "Gia vị",
    prefix: "893SPI",
    xRange: [30, 50],
    yRange: [40, 60],
    items: [
      "Nước mắm Nam Ngư 750ml", "Dầu ăn Tường An 1L", "Đường tinh luyện Biên Hòa 1kg", "Hạt nêm Knorr 400g", "Nước tương Maggi 700ml",
      "Tương ớt Chinsu 250g", "Muối tinh sấy 500g", "Bột ngọt Ajinomoto 400g", "Tiêu đen xay 100g", "Giấm gạo lên men 500ml"
    ]
  },
  {
    category: "Đồ gia dụng",
    prefix: "893HOM",
    xRange: [60, 80],
    yRange: [40, 60],
    items: [
      "Chảo Chống Dính Sunhouse 24cm", "Bộ Thau Rổ Nhựa Inochi", "Nồi Inox 3 Đáy 20cm", "Bộ 3 Hộp Nhựa Đựng Thực Phẩm", "Móc Treo Quần Áo Nhựa (Lốc 10)",
      "Bóng Đèn LED Điện Quang 9W", "Pin AA Energizer (Vỉ 2 viên)", "Ổ Cắm Điện 3 Lỗ Lioa", "Băng Keo Trong 5cm", "Khăn Lau Bếp Đa Năng (Combo 3)"
    ]
  },
  {
    category: "Mẹ & Bé",
    prefix: "893BAB",
    xRange: [60, 80],
    yRange: [80, 100],
    items: [
      "Tã Quần Bobby Size L (68 miếng)", "Sữa Bột Friso Gold 4 900g", "Khăn Ướt Bobby (Gói 100 miếng)", "Sữa Tắm Gội Trẻ Em Pigeon 700ml", "Bình Sữa Avent 260ml",
      "Phấn Rôm Johnson's Baby 200g", "Kem Chống Hăm Sudocrem 60g", "Nước Rửa Bình Sữa D-nee 620ml", "Bánh Ăn Dặm Gerber", "Nước Xả Vải D-nee Trắng 3L"
    ]
  },
  {
    category: "Hóa mỹ phẩm",
    prefix: "893CHE",
    xRange: [80, 100],
    yRange: [80, 100], // Mathematically far from Hàng tươi sống (0-20, 0-20)
    items: [
      "Nước Giặt OMO Matic 3.1kg", "Nước Xả Vải Downy Đam Mê 3L", "Nước Rửa Chén Sunlight Chanh 3.8kg", "Sữa Tắm Lifebuoy Bảo Vệ Vượt Trội 1.1kg", "Dầu Gội Clear Bạc Hà 630g",
      "Kem Đánh Răng P/S Bảo Vệ 123 240g", "Sữa Rửa Mặt CeraVe 236ml", "Nước Lau Sàn Sunlight 3.8kg", "Bột Giặt Tide Trắng Đột Phá 5.5kg", "Nước Tẩy Bồn Cầu Vim 900ml"
    ]
  }
];

const allProducts = categoryData.flatMap((cat, catIdx) => {
  return cat.items.map((name, itemIdx) => {
    return {
      id: `P-${cat.prefix.replace('893', '')}-${itemIdx + 1}`,
      name,
      category: cat.category,
      subCategory: cat.category, // Simplifying sub-category for now
      price: Math.floor(Math.random() * 20 + 5) * 5000,
      quantity: 0,
      revenue: 0,
      stockLevel: Math.floor(Math.random() * 100 + 20),
      lowStockAlert: false,
      image: `https://ui-avatars.com/api/?name=${encodeURIComponent(name.charAt(0))}&background=random&color=fff&size=200`,
      barcode: generateBarcode(catIdx * 10 + itemIdx, cat.prefix),
      coordinates: {
        x: getRandomCoord(cat.xRange[0], cat.xRange[1]),
        y: getRandomCoord(cat.yRange[0], cat.yRange[1])
      }
    };
  });
});

async function seedDatabase() {
  try {
    await mongoose.connect(dbURI);
    console.log('✅ Kết nối MongoDB thành công.');

    console.log('🗑️ Xóa toàn bộ sản phẩm cũ...');
    await Product.deleteMany({});
    
    console.log(`🌱 Đang chèn ${allProducts.length} sản phẩm mới...`);
    await Product.insertMany(allProducts);
    
    console.log('🎉 Hoàn tất Seeding cơ sở dữ liệu!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Lỗi Seeding:', err);
    process.exit(1);
  }
}

seedDatabase();
