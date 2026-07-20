# 🛒 Smart Shopping Cart - Tablet UI

Ứng dụng xe đẩy thông minh (Smart Shopping Cart) với giao diện máy tính bảng, tích hợp AI, quét mã vạch, camera giám sát và hệ thống quản lý cửa hàng toàn diện.

## 📋 Mục lục

- [Yêu cầu hệ thống](#-yêu-cầu-hệ-thống)
- [Cài đặt & Cấu hình](#-cài-đặt--cấu-hình)
- [Chạy ứng dụng](#-chạy-ứng-dụng)
- [Tài khoản mẫu](#-tài-khoản-mẫu)
- [Truy cập ứng dụng](#-truy-cập-ứng-dụng)
- [Cấu trúc thư mục](#-cấu-trúc-thư-mục)
- [Các lệnh hữu ích](#-các-lệnh-hữu-ích)
- [Xử lý sự cố](#-xử-lý-sự-cố)

---

## ⚙️ Yêu cầu hệ thống

| Phần mềm     | Phiên bản tối thiểu |
|-------------|-------------------|
| Node.js     | 18.x trở lên      |
| npm         | 9.x trở lên       |
| MongoDB     | 6.x trở lên       |
| Trình duyệt | Chrome/Firefox/Edge mới nhất |

## 🔧 Cài đặt & Cấu hình

### Bước 1: Mở terminal tại thư mục dự án

```bash
cd Smart-Cart-AI-main
```

> **Lưu ý:** Nếu bạn thấy cấu trúc thư mục lồng nhau (`Smart-Cart-AI-main/Smart-Cart-AI-main/`), hãy di chuyển vào thư mục trong cùng:

```bash
cd Smart-Cart-AI-main/Smart-Cart-AI-main
```

### Bước 2: Cài đặt MongoDB

**Tùy chọn A — Dùng MongoDB Local:**

1. Tải và cài đặt [MongoDB Community Server](https://www.mongodb.com/try/download/community)
2. Sau khi cài đặt, MongoDB sẽ chạy ngầm tại `mongodb://localhost:27017`

**Tùy chọn B — Dùng MongoDB Atlas (Cloud):**

1. Đăng ký tài khoản tại [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Tạo cluster miễn phí (M0)
3. Lấy Connection String (URI) từ Atlas Dashboard → Connect → Drivers

### Bước 3: Tạo file .env

Tạo file `.env` trong thư mục **`server/`**:

```bash
# server/.env

# MongoDB Connection String (bắt buộc)
MONGODB_URI=mongodb://localhost:27017/smartcart

# Cổng chạy server (mặc định: 5000)
PORT=5000

# JWT Secret Key (mặc định có sẵn, nên thay đổi nếu deploy)
JWT_SECRET=smartcart-secret-key-123

# ---- Cấu hình SMTP (không bắt buộc) ----
# Nếu không cấu hình, email xác thực sẽ được in ra console khi chạy dev
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your-email@gmail.com
# SMTP_PASS=your-app-password
# SMTP_FROM="Smart Cart AI <no-reply@smartcart.local>"
```

> **Ví dụ URI cho MongoDB Atlas:**
> ```
> MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/smartcart?retryWrites=true&w=majority
> ```

### Bước 4: Cài đặt dependencies

```bash
npm install
```

Lệnh này sẽ cài đặt tất cả dependencies cho cả **client** và **server** (monorepo với npm workspaces).

### Bước 5: Seed dữ liệu mẫu

Dữ liệu mẫu sẽ được **tự động seed** vào database khi server khởi động lần đầu. Tuy nhiên, nếu muốn seed lại hoặc reseed dữ liệu, chạy:

```bash
npm run seed -w server
```

Dữ liệu mẫu bao gồm:

| Loại dữ liệu      | Chi tiết                                                       |
|------------------|----------------------------------------------------------------|
| 👤 **Admin**     | 2 tài khoản quản trị                                            |
| 👥 **Customer**  | 3 tài khoản khách hàng                                         |
| 📦 **Sản phẩm**  | 10 sản phẩm các loại (thịt, cá, rau củ, đồ khô, đông lạnh...) |
| 🛒 **Xe đẩy**    | 35 xe đẩy với trạng thái và tọa độ trên bản đồ                 |
| 🚨 **Cảnh báo**  | 2 cảnh báo bảo mật mẫu                                         |
| 📋 **Đơn hàng**  | 1 đơn hàng mẫu                                                 |
| 📝 **Nhật ký**   | 2 nhật ký hệ thống                                             |

## 🚀 Chạy ứng dụng

### Chạy toàn bộ hệ thống (Server + Client)

```bash
npm run dev
```

Lệnh này sử dụng `concurrently` để chạy đồng thời cả server và client.

### Chạy riêng từng phần

**Chạy Server** (backend Express + Socket.IO):

```bash
npm run dev:server
```

**Chạy Client** (frontend React + Vite):

```bash
npm run dev:client
```

### Build frontend cho production

```bash
npm run build -w client
```

## 🔑 Tài khoản mẫu

### Admin (Quản trị viên)

| Số điện thoại | Mã PIN      | Vai trò | Ghi chú      |
|---------------|-------------|---------|--------------|
| `0987654321`  | `654321`    | admin   | Root Admin   |
| `0988888888`  | `888888`    | admin   | Son Nguyen   |

> **Đăng nhập Admin:** Vào ứng dụng → bấm nút **Admin** → nhập số điện thoại và mã PIN.

### Customer (Khách hàng)

| Số điện thoại | Mã PIN | Tên           | Điểm tích lũy |
|---------------|--------|---------------|---------------|
| `0912345678`  | `111111` | Nguyễn Văn A | 1,250 điểm    |
| `0988888888`  | `222222` | Sơn Nguyễn    | 2,500 điểm    |
| `0901234567`  | `333333` | Trần Thị B    | 800 điểm      |

> **Đăng nhập Customer:** Vào ứng dụng → nhập số điện thoại và mã PIN → chọn **Customer Login**.

## 🌐 Truy cập ứng dụng

| Thành phần | URL                      | Cổng |
|-----------|--------------------------|------|
| **Client** (Giao diện) | `http://localhost:5173`  | 5173 |
| **Server** (API)       | `http://localhost:5000`  | 5000 |
| **Health Check**       | `http://localhost:5000/api/health` | 5000 |

## 📁 Cấu trúc thư mục

```
Smart-Cart-AI-main/
├── client/                              # Frontend React + Vite
│   ├── index.html                       # Entry HTML
│   ├── vite.config.ts                   # Cấu hình Vite
│   ├── tsconfig.json                    # Cấu hình TypeScript
│   ├── postcss.config.mjs               # Cấu hình PostCSS
│   ├── package.json
│   └── src/
│       ├── main.tsx                     # Entry point React
│       ├── app/
│       │   ├── App.tsx                  # Component gốc + Router
│       │   ├── api.ts                   # Axios API client
│       │   ├── shared.tsx               # Shared components
│       │   ├── components/
│       │   │   ├── AdminProtectedRoute.tsx
│       │   │   ├── figma/
│       │   │   │   └── ImageWithFallback.tsx
│       │   │   └── ui/                  # shadcn/ui components
│       │   ├── contexts/
│       │   │   ├── BranchContext.tsx
│       │   │   └── GatewayContext.tsx
│       │   ├── hooks/
│       │   │   └── useSocket.ts         # Socket.IO hook
│       │   └── screens/
│       │       ├── HomeScreen.tsx       # Màn hình chính
│       │       ├── LoginScreen.tsx      # Đăng nhập
│       │       ├── CartScreen.tsx       # Giỏ hàng
│       │       ├── AdminDashboardScreen.tsx  # Dashboard Admin
│       │       ├── AdminLoginScreen.tsx      # Đăng nhập Admin
│       │       ├── CategoryScreen.tsx   # Danh mục sản phẩm
│       │       ├── MapScreen.tsx        # Bản đồ cửa hàng
│       │       ├── OffersScreen.tsx     # Khuyến mãi
│       │       ├── GroupSessionScreen.tsx   # Mua theo nhóm
│       │       ├── AccountScreen.tsx    # Tài khoản
│       │       ├── DigitalInvoiceScreen.tsx  # Hóa đơn điện tử
│       │       ├── PurchaseHistoryScreen.tsx # Lịch sử mua hàng
│       │       ├── SplashScreen.tsx     # Màn hình chào
│       │       ├── MobileAuthPortalScreen.tsx
│       │       ├── GatewayPortalScreen.tsx
│       │       ├── CustomerCrmTab.tsx
│       │       ├── HelpdeskTab.tsx
│       │       ├── SystemSettingsScreen.tsx
│       │       ├── settings/            # Các tab cài đặt
│       │       │   ├── AccountsConfigTab.tsx
│       │       │   ├── AICartConfigTab.tsx
│       │       │   ├── BackupConfigTab.tsx
│       │       │   ├── ChatbotConfigTab.tsx
│       │       │   ├── MapConfigTab.tsx
│       │       │   ├── PaymentConfigTab.tsx
│       │       │   └── SystemUIConfigTab.tsx
│       │       └── gateway/             # Gateway screen
│       │           ├── GatewayDashboard.tsx
│       │           ├── GatewayInspectionView.tsx
│       │           └── GatewayLoginScreen.tsx
│       ├── imports/
│       │   └── image.png
│       └── styles/
│           ├── fonts.css
│           ├── globals.css
│           ├── index.css
│           ├── tailwind.css
│           └── theme.css
│
├── server/                              # Backend Express + MongoDB
│   ├── tsconfig.json
│   ├── package.json
│   └── src/
│       ├── index.ts                     # Entry point server
│       ├── reseed.ts                    # Script reseed database
│       ├── config/
│       │   ├── db.ts                    # Kết nối MongoDB
│       │   ├── mail.ts                  # Cấu hình email
│       │   ├── seed.ts                  # Seed dữ liệu mẫu
│       │   └── seedProducts.ts          # Seed sản phẩm
│       ├── middleware/
│       │   └── auth.ts                  # JWT auth middleware
│       ├── models/                      # Mongoose models
│       │   ├── Admin.ts
│       │   ├── Branch.ts
│       │   ├── Cart.ts
│       │   ├── Customer.ts
│       │   ├── GatewayLog.ts
│       │   ├── GroupSession.ts
│       │   ├── Order.ts
│       │   ├── Product.ts
│       │   ├── QRSession.ts
│       │   ├── SecurityAlert.ts
│       │   ├── SupportTicket.ts
│       │   ├── SystemLog.ts
│       │   └── SystemSettings.ts
│       ├── controllers/                 # API controllers
│       └── routes/                      # API routes
│
├── guidelines/
│   └── Guidelines.md
├── apply_final_theme.js                 # Script áp dụng theme
├── apply_glass_buttons.js               # Script glassmorphism buttons
├── apply_green_monogram.js              # Script monogram
├── fix_*.js                             # Script sửa lỗi
├── rewrite_admin.js                     # Script rewrite admin
├── replace_script*.js                   # Script thay thế
├── patch_admin.js                       # Script patch admin
├── ATTRIBUTIONS.md
├── TODO.md
└── package.json                         # Root monorepo config
```

## 📝 Các lệnh hữu ích

| Lệnh                                  | Mô tả                                    |
|---------------------------------------|------------------------------------------|
| `npm install`                         | Cài đặt tất cả dependencies              |
| `npm run dev`                         | Chạy server + client đồng thời           |
| `npm run dev:server`                  | Chạy riêng server                        |
| `npm run dev:client`                  | Chạy riêng client                        |
| `npm run build -w client`             | Build client cho production              |
| `npm run seed -w server`              | Seed / reseed database                   |

## ❗ Xử lý sự cố

### 1. Lỗi kết nối MongoDB

```
Error connecting to MongoDB: MONGODB_URI is not defined in environment variables
```

**Giải pháp:** Đảm bảo đã tạo file `server/.env` với đúng biến `MONGODB_URI`.

### 2. Lỗi `port 5000 already in use`

**Giải pháp:** Đổi cổng trong file `server/.env`:
```
PORT=5001
```

### 3. Lỗi `Cannot find module` khi chạy

**Giải pháp:** Chạy lại `npm install` ở thư mục gốc (root).

### 4. Dữ liệu không được seed

Server sẽ tự động seed dữ liệu khi khởi động và phát hiện database trống. Nếu muốn seed thủ công:

```bash
npm run seed -w server
```

### 5. Lỗi CORS khi gọi API

Server đã cấu hình CORS cho phép tất cả origin (`*`). Nếu gặp lỗi, kiểm tra lại URL trong file `client/src/app/api.ts`.

### 6. WebSocket không kết nối

Kiểm tra server đã chạy chưa. Socket.IO client sẽ tự động kết nối tới `http://localhost:5000`.

---

## 📄 Giấy phép

Dự án này dựa trên mã nguồn từ [Smart Shopping Cart Tablet UI trên Figma](https://www.figma.com/design/YJmY7JUv9ofz9tQlLMLZ0v/Smart-Shopping-Cart-Tablet-UI).

Xem [ATTRIBUTIONS.md](./ATTRIBUTIONS.md) để biết thêm chi tiết.

