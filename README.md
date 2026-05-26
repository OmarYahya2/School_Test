# School Management System (نظام إدارة مدرسي متكامل)

This project has been restructured and migrated from direct Supabase integration to a professional Node.js Express backend with Prisma ORM and PostgreSQL database.

تمت إعادة هيكلة هذا المشروع وترحيله من التكامل المباشر مع Supabase إلى خادم Node.js Express احترافي باستخدام Prisma ORM وقاعدة بيانات PostgreSQL.

---

## Repository Structure (هيكل المشروع)

```text
scool/
├── frontend/   → Next.js 16 (React 19 + TypeScript) Web UI
├── backend/    → Node.js + Express + Prisma (PostgreSQL API)
└── README.md   → Monorepo documentation
```

---

## 🚀 Getting Started (البدء والتشغيل)

### 1. Database Setup (إعداد قاعدة البيانات)

Ensure you have a PostgreSQL database running (e.g. locally or on Neon).
تأكد من تشغيل قاعدة بيانات PostgreSQL (محلياً أو على Neon).

In `backend/.env`, configure your database URL:
في ملف `backend/.env` قم بضبط رابط قاعدة البيانات:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/scool?schema=public"
```

### 2. Backend Setup & Run (إعداد وتشغيل الخادم الخلفي)

Navigate to the backend directory, install dependencies, sync the database schema, and run the development server:
انتقل إلى مجلد backend، ثم قم بتثبيت الاعتماديات، ومزامنة الجداول، وتشغيل الخادم:

```bash
cd backend
npm install
npm run prisma:generate
npx prisma db push
npm run dev
```

The backend server will run on `http://localhost:3001`.

### 3. Frontend Setup & Run (إعداد وتشغيل الواجهة الأمامية)

Navigate to the frontend directory, install dependencies, and run the Next.js development server:
انتقل إلى مجلد frontend، وثبت الاعتماديات، وشغل واجهة Next.js:

```bash
cd frontend
npm install
npm run dev
```

The frontend will run on `http://localhost:3000`.

---

## 🛠️ Technology Stack (التقنيات المستخدمة)

- **Frontend**: Next.js 16, React 19, Tailwind CSS, TypeScript
- **Backend API**: Node.js, Express.js
- **ORM**: Prisma Client
- **Database**: PostgreSQL (Neon / Local)
- **Auth**: JSON Web Tokens (JWT)
