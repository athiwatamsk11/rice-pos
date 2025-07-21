# ระบบ POS ร้านขายข้าวสาร

ระบบ Point of Sale สำหรับร้านขายข้าวสารที่พัฒนาด้วย HTML, CSS, และ JavaScript พร้อมการเชื่อมต่อ Firebase Firestore สำหรับการจัดเก็บข้อมูลแบบ Real-time

## โครงสร้างไฟล์

```
rice-pos/
├── index.html          # ไฟล์ HTML หลัก
├── styles.css          # ไฟล์ CSS สำหรับการจัดรูปแบบ
├── app.js              # ไฟล์ JavaScript หลัก (Firebase config และ initialization)
├── modules/            # โฟลเดอร์สำหรับ JavaScript modules
│   ├── ui.js           # UI functions (tabs, modals, rendering)
│   ├── cart.js         # Cart management functions
│   ├── products.js     # Product management functions
│   ├── admin.js        # Admin functions (login, clear history)
│   └── notifications.js # Notification system
└── README.md           # ไฟล์นี้
```

## คุณสมบัติหลัก

### 🛒 การขายสินค้า
- เพิ่มสินค้าลงตะกร้า
- ปรับจำนวนสินค้าในตะกร้า
- คำนวณยอดรวมและเงินทอน
- อัปเดต stock อัตโนมัติ

### 📦 จัดการ Stock
- เพิ่ม/ลด stock สินค้า
- แสดงสถานะ stock แบบ real-time
- แจ้งเตือนเมื่อ stock ต่ำ

### 📋 ประวัติการขาย
- ดูประวัติการขายทั้งหมด
- กรองตามช่วงวันที่
- พิมพ์ PDF ประวัติการขาย

### ⚙️ จัดการสินค้า (Admin)
- เพิ่มสินค้าใหม่
- แก้ไขข้อมูลสินค้า
- ลบสินค้า
- อัปโหลดรูปภาพสินค้า

### 📊 รายงานยอดขาย
- กราฟยอดขายสินค้า Top 10 รายเดือน
- กราฟยอดขายรวมรายเดือน
- สรุปสถิติต่างๆ

### 🔔 ระบบแจ้งเตือน
- แจ้งเตือนเมื่อ stock ต่ำ
- ประวัติการแจ้งเตือน
- กระดิ่งแจ้งเตือนแบบ real-time

## การติดตั้ง

1. **Clone หรือ Download โปรเจค**
2. **เปิดไฟล์ `index.html` ในเว็บเบราว์เซอร์**
3. **ระบบจะเชื่อมต่อกับ Firebase Firestore อัตโนมัติ**

## การใช้งาน

### โหมดพนักงาน
- ขายสินค้า
- จัดการ stock
- ดูประวัติการขาย
- ดูรายงาน

### โหมดผู้ดูแล
- รหัสผ่าน: `admin123`
- จัดการสินค้า (เพิ่ม/แก้ไข/ลบ)
- ล้างประวัติการขาย
- ล้างประวัติการแจ้งเตือน

## เทคโนโลยีที่ใช้

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Database**: Firebase Firestore
- **Charts**: Chart.js
- **Real-time Sync**: Firebase onSnapshot

## การพัฒนา

### การเพิ่มฟีเจอร์ใหม่
1. เพิ่มฟังก์ชันในไฟล์ module ที่เหมาะสม
2. Import ฟังก์ชันใน `app.js`
3. เพิ่ม event listeners ใน `setupEventListeners()`

### การแก้ไข UI
- แก้ไข `styles.css` สำหรับการจัดรูปแบบ
- แก้ไข `index.html` สำหรับโครงสร้าง HTML

### การแก้ไข Logic
- แก้ไขไฟล์ในโฟลเดอร์ `modules/` ตามฟังก์ชันที่เกี่ยวข้อง

## การ Deploy

### GitHub Pages
1. สร้าง repository บน GitHub
2. Upload ไฟล์ทั้งหมด
3. เปิด Settings > Pages
4. เลือก Source เป็น "Deploy from a branch"
5. เลือก branch "main" และ folder "/ (root)"

### Firebase Hosting
1. ติดตั้ง Firebase CLI
2. รัน `firebase init hosting`
3. รัน `firebase deploy`

## การแก้ไขปัญหา

### ปุ่มไม่ทำงาน
- ตรวจสอบ Console ใน Developer Tools
- ตรวจสอบ event listeners ใน `setupEventListeners()`

### ข้อมูลไม่ sync
- ตรวจสอบการเชื่อมต่อ Firebase
- ตรวจสอบ Firebase config ใน `app.js`

### UI แสดงผลผิด
- ตรวจสอบ CSS ใน `styles.css`
- ตรวจสอบ HTML structure ใน `index.html`

## License

MIT License - ใช้งานได้อย่างอิสระ 