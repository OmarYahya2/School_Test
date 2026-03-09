# School Management System

نظام إدارة مدرسي متكامل مبني على Next.js و Supabase

## المميزات

- إدارة الطلاب والصفوف الدراسية
- نظام تقييم وإدارة العلامات
- متابعة الحضور والغيابات
- إدارة الملاحظات الطلابية
- رموز QR للوصول السريع للصفوف
- واجهة مستخدم عربية متجاوبة

## التقنيات المستخدمة

- **Frontend**: Next.js 16, React 19, TypeScript
- **Backend**: Supabase
- **UI**: Tailwind CSS, Radix UI
- **Icons**: Lucide React
- **Charts**: Recharts
- **Deployment**: Vercel

## التثبيت والتشغيل

1. تثبيت الاعتماديات:
   ```bash
   npm install
   ```

2. إعداد متغيرات البيئة:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. تشغيل الخادم التطويري:
   ```bash
   npm run dev
   ```

4. بناء المشروع للنشر:
   ```bash
   npm run build
   ```

## النشر على Vercel

المشروع جاهز للنشر على Vercel مع:

- إعدادات Build مكتملة
- متغيرات البيئة محددة
- ملف vercel.json للإعدادات المخصصة
- .gitignore محدث للنشر

