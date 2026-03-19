# แผนพัฒนาเว็บไซต์ขายเสื้อผ้า "TS Tha" (อัปเดตตามบรีฟใหม่)

การออกแบบทั้งหมดจะเน้น **โทนสวยงามพรีเมียม, มีระบบ Dark/Light Mode, อนิเมชั่นลื่นไหล, เสถียรและใช้งานง่ายที่สุด**

---

## 📁 โครงสร้างโฟลเดอร์ (File Structure)

```
TS Tha/
├── index.html                  ← หน้าแรก (Home + Shop + Checkout)
├── assets/
│   ├── css/
│   │   └── style.css           ← CSS Global (Dark/Light Mode, Animations)
│   ├── js/
│   │   ├── app.js              ← Logic หน้า User (Slider, Cart, Order)
│   │   └── firebase.js         ← Firebase Config & Functions
│   └── img/                   ← รูปภาพสินค้า
├── admin/
│   ├── index.html              ← Admin Panel
│   ├── admin.css               ← CSS เฉพาะ Admin
│   └── admin.js                ← Logic Admin (Orders, Products)
└── docs/
    ├── project_plan.md         ← เอกสารนี้
    ├── sitemap.mmd             ← แผนผังเว็บไซต์
    └── flow.mmd                ← แผนผังการทำงานระบบ
```

---

## 💻 1. ส่วนของลูกค้า (Frontend)

- **Hero Banner:** Slider รูปภาพเลื่อนอัตโนมัติ, Arrows + Dots
- **Product Showcase:** กรองสินค้าตามหมวดหมู่, Hover Effects
- **Cart Drawer:** รถเข็นแบบ Slide-in จากขวา, ปรับจำนวนได้
- **Checkout Flow:**
  1. กรอกข้อมูลชื่อ, ที่อยู่, เบอร์โทร
  2. ยืนยันการสั่งซื้อ
  3. รับ **Order ID** (เช่น `#TS-ABC123`)
  4. แคปหน้าจอ/คัดลอก → ทักแชท Line/Facebook
- **Dark/Light Mode:** Toggle ที่ Navbar ทุกหน้า
- **Track Order:** ค้นหาสถานะออเดอร์ด้วย Order ID

---

## ⚙️ 2. Admin Panel

- ค้นหาออเดอร์ด้วย Order ID
- เปลี่ยนสถานะคำสั่งซื้อ (pending → confirmed → shipped → cancelled)
- แนบเลขพัสดุ
- จัดการสินค้า (เพิ่ม/ลบ/แก้ไข + อัปโหลดรูป)
- Dashboard ยอดขายรายวัน

---

## 🛠 3. Tech Stack

| ส่วน | เทคโนโลยี |
|------|-----------|
| Frontend | HTML5 + CSS3 (Vanilla) + JavaScript |
| Icons | Font Awesome 6 |
| Fonts | Google Fonts (Outfit + Noto Sans Thai) |
| Backend | Firebase Firestore (Database) |
| Auth | Firebase Authentication (Google + Email) |
| Storage | Firebase Storage (รูปสินค้า) |
| Hosting | Firebase Hosting / Vercel |

---

## 🚀 Roadmap

- [x] วางโครงสร้างไฟล์ (File Structure)
- [x] ออกแบบ CSS Global + Design System
- [x] HTML หน้า User (Hero, Shop, Cart, Checkout)
- [ ] JS Logic (Slider, Cart, Order ID)
- [ ] Firebase Integration (Orders, Auth)
- [ ] Admin Panel (HTML + CSS + JS)
- [ ] Test & Deploy
