# 💼 Aplikasi Setor Barang

> Sistem manajemen setoran barang modern dengan tracking pembayaran, monitoring nasabah, dan perhitungan keuntungan otomatis.

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-7-2d3748)](https://www.prisma.io/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## ✨ Fitur Utama

- 🔐 **Autentikasi Aman** - Login dengan NextAuth v5
- 📊 **Dashboard Real-time** - Statistik lengkap bisnis Anda
- 👥 **Manajemen Nasabah** - Kelola data pelanggan dengan mudah
- 💰 **Tracking Setoran** - Monitor pembayaran (sudah setor berapa kali)
- 📈 **Sisa Setoran** - Hitung otomatis sisa pembayaran
- 💵 **Keuntungan Per Bulan** - Lihat total profit bulanan
- ✅ **Status Bulan Ini** - Cek siapa yang sudah/belum setor
- 📝 **Riwayat Lengkap** - History semua pembayaran

## 🚀 Quick Start

### Prasyarat
- Node.js 18+ 
- Akun [Neon](https://neon.tech) (gratis)

### Setup dalam 5 Menit

```bash
# 1. Install dependencies
cd setor-barang
npm install

# 2. Setup environment variables
# Edit .env dengan connection string dari Neon

# 3. Setup database
npx prisma db push
npx prisma db seed

# 4. Jalankan aplikasi
npm run dev
```

**Login Default:**
- Email: `admin@example.com`
- Password: `admin123`

📖 **Panduan Lengkap**: Lihat [CARA_PAKAI.md](./CARA_PAKAI.md) untuk instruksi detail dalam Bahasa Indonesia

## 🛠️ Tech Stack

| Kategori | Teknologi |
|----------|-----------|
| **Framework** | Next.js 15 (App Router) |
| **Styling** | Tailwind CSS 4 |
| **Database** | PostgreSQL (Neon) |
| **ORM** | Prisma 7 |
| **Auth** | NextAuth v5 |
| **Language** | TypeScript |

## 📸 Screenshots

### Dashboard
![Dashboard](https://via.placeholder.com/800x400?text=Dashboard+Screenshot)

### Tambah Nasabah
![Tambah Nasabah](https://via.placeholder.com/800x400?text=Tambah+Nasabah+Screenshot)

### Detail Setoran
![Detail](https://via.placeholder.com/800x400?text=Detail+Setoran+Screenshot)

## 📁 Struktur Project

```
setor-barang/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   ├── dashboard/         # Dashboard pages
│   ├── login/             # Login page
│   └── layout.tsx         # Root layout
├── lib/                   # Utilities
│   ├── auth.ts           # NextAuth config
│   ├── prisma.ts         # Prisma client
│   └── utils.ts          # Helper functions
├── prisma/               # Database
│   ├── schema.prisma     # Schema
│   └── seed.ts           # Seed script
└── middleware.ts         # Auth middleware
```

## 📚 Dokumentasi

| Dokumen | Deskripsi |
|---------|-----------|
| [CARA_PAKAI.md](./CARA_PAKAI.md) | 🇮🇩 Panduan lengkap Bahasa Indonesia |
| [QUICKSTART.md](./QUICKSTART.md) | ⚡ Setup cepat 5 menit |
| [SETUP.md](./SETUP.md) | 🔧 Panduan setup detail |
| [USER_GUIDE.md](./USER_GUIDE.md) | 📖 Panduan pengguna end-to-end |
| [API.md](./API.md) | 🔌 Dokumentasi API |
| [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) | 🏗️ Arsitektur & struktur |
| [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) | ✅ Checklist deployment |

## 🎯 Use Cases

### Contoh Penggunaan

**Kasus**: Pak Budi setor Motor Honda Beat

**Input**:
- Nama: Budi Santoso
- Barang: Motor Honda Beat 2024
- Harga: Rp 15.000.000
- Setoran: 10 kali @ Rp 1.500.000
- Keuntungan: Rp 500.000/bulan

**Hasil**:
- ✅ Tracking otomatis: 0/10 setoran
- ✅ Sisa: Rp 15.000.000
- ✅ Keuntungan: Rp 500.000/bulan
- ✅ Status: Belum setor bulan ini

## 🔐 Security

- ✅ Password hashing dengan bcryptjs
- ✅ JWT session dengan NextAuth
- ✅ Protected routes dengan middleware
- ✅ SSL database connection (Neon)
- ✅ Environment variables untuk secrets
- ✅ No SQL injection (Prisma prepared statements)

## 📱 Responsive Design

- ✅ Desktop (1920px+)
- ✅ Laptop (1366px - 1920px)
- ✅ Tablet (768px - 1366px)
- ✅ Mobile (320px - 768px)

## 🚀 Deployment

### Deploy ke Vercel (Gratis)

1. Push ke GitHub
2. Import di [Vercel](https://vercel.com)
3. Set environment variables
4. Deploy! 🎉

**Environment Variables Production:**
```env
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=your-production-secret
NEXTAUTH_URL=https://your-domain.com
```

## 🧪 Development

```bash
# Development server
npm run dev

# Build production
npm run build

# Start production
npm start

# Database GUI
npx prisma studio

# Reset database
npx prisma migrate reset
```

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Prisma](https://www.prisma.io/) - Database ORM
- [NextAuth](https://next-auth.js.org/) - Authentication
- [Neon](https://neon.tech/) - Serverless PostgreSQL

## 📞 Support

- 📧 Email: [your-email@example.com]
- 💬 Issues: [GitHub Issues](https://github.com/yourusername/setor-barang/issues)
- 📖 Docs: [Documentation](./CARA_PAKAI.md)

## 🔮 Roadmap

- [ ] Edit data nasabah
- [ ] Hapus nasabah
- [ ] Export data (Excel/PDF)
- [ ] Laporan bulanan
- [ ] Notifikasi WhatsApp
- [ ] Multi-user dengan roles
- [ ] Mobile app (React Native)

---

<p align="center">
  <strong>Dibuat dengan ❤️ menggunakan Next.js, Tailwind CSS, Prisma, dan Neon</strong>
</p>

<p align="center">
  <a href="./CARA_PAKAI.md">🇮🇩 Baca Panduan Bahasa Indonesia</a> •
  <a href="./QUICKSTART.md">⚡ Quick Start</a> •
  <a href="./USER_GUIDE.md">📖 User Guide</a>
</p>
