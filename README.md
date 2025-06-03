# 📰 IDNemas45 - Simple Web Artikel

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-2.2.19-blue?logo=tailwind-css)
![TypeScript](https://img.shields.io/badge/TypeScript-4.9-blue?logo=typescript)

> IDNemas45 adalah website artikel sederhana yang menggabungkan **fetch API (NewsAPI)** dan **manajemen data (CRUD)** secara efisien dengan dukungan autentikasi dan dashboard admin. Dibuat dengan Next.js 15 dan Supabase.

---

## ✨ Fitur Utama

- 🔐 **Authentication** — via NextAuth (email/password)
- 🧱 **Role-based Middleware** — admin & user
- ✍️ **CRUD Artikel** — Buat, edit, hapus artikel
- 🔎 **Fetch dari NewsAPI** — Menarik artikel topik tertentu
- 💾 **Database PostgreSQL (via Supabase)**
- 💨 **Tailwind + Shadcn UI** — UI modern
- 🔁 **Validasi data** — pakai Zod

---

## 🖼️ Preview

<div align="center">

### 🏠 Homepage
![Homepage](/public/homepage.png)
*Tampilan homepage dengan berita terkini dan harga emas*

 ---

### 📊 Dashboard  
![Dashboard](/public/dashboard.png)
*Real-time gold price monitoring*
</div>

🔗 **Live URL**: [https://idnemas45.vercel.app](https://idnemas45.vercel.app)

---

## 🧪 Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | [Next.js 15](https://nextjs.org/) |
| **Database** | [Supabase](https://supabase.com/) (PostgreSQL) |
| **ORM** | [Prisma](https://www.prisma.io/) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/) |
| **Authentication** | [NextAuth.js](https://next-auth.js.org/) |
| **Data Fetching** | [Axios](https://axios-http.com/) |
| **Validation** | [Zod](https://zod.dev/) |

---

## 🚀 Instalasi & Setup Lokal

### 1. Clone Repository
```bash
git clone https://github.com/dikamulyana202/IDNemas45.git
cd IDNemas45
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
```bash
cp .env.example .env.local
```

Edit `.env.local` dengan konfigurasi berikut:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Database
DATABASE_URL="postgresql://username:password@host:port/database"

# NewsAPI
NEWS_API_KEY=your_newsapi_key

# NextAuth
NEXTAUTH_SECRET=your_nextauth_secret_key
NEXTAUTH_URL=http://localhost:3000
```

### 4. Setup Database
```bash
# Generate Prisma client
npx prisma generate

# Push schema ke database
npx prisma db push

# Seed data admin
npx prisma db seed

# fetching data articles
npx ts-node scripts/runFetch.ts
```

### 5. Jalankan Development Server
```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

---

## 🔑 Default Admin Login

Setelah menjalankan seed:
- **Email**: `admin@gmail.com`
- **Password**: `asd`

---

## 🛡️ Security Features

- ✅ **Password Hashing** menggunakan bcryptjs
- ✅ **JWT Tokens** untuk session management
- ✅ **Role-based Access Control** (Admin/User)
- ✅ **Input Validation** menggunakan Zod

---

## 📞 Contact & Support

- **Developer**: [Your Name](https://github.com/username)
- **Email**: developer@idnemas45.com
- **Project Link**: [https://github.com/username/idnemas45](https://github.com/username/idnemas45)

---

## 🙏 Acknowledgments

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Guides](https://supabase.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [NewsAPI](https://newsapi.org/)

---

<div align="center">
  <p>Made with ❤️ by <strong>Dika Mulyana</strong></p>
  <p>⭐ Star this repo if you find it helpful!</p>
</div>