-- ========== حذف جميع الجداول القديمة ==========

-- حذف الجداول بالترتيب الصحيح (الجداول التي تعتمد عليها أولاً)
DROP TABLE IF EXISTS public.subject_files CASCADE;
DROP TABLE IF EXISTS public.grades CASCADE;
DROP TABLE IF EXISTS public.attendance_records CASCADE;
DROP TABLE IF EXISTS public.schedule CASCADE;
DROP TABLE IF EXISTS public.students CASCADE;
DROP TABLE IF EXISTS public.teacher_assignments CASCADE;
DROP TABLE IF EXISTS public.classes CASCADE;
DROP TABLE IF EXISTS public.teachers CASCADE;

-- حذف الأنواع المخصصة إذا وجدت
DROP TYPE IF EXISTS public.attendance_with_name CASCADE;

-- ========== إنشاء الجداول من جديد ==========

-- جدول المعلمين
CREATE TABLE IF NOT EXISTS public.teachers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  subject TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- جدول الصفوف
CREATE TABLE IF NOT EXISTS public.classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  teacher_id UUID REFERENCES public.teachers(id) ON DELETE SET NULL,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- جدول الطلاب
CREATE TABLE IF NOT EXISTS public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  age INT NOT NULL CHECK (age >= 3 AND age <= 25),
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  parent_phone TEXT NOT NULL,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- جدول الحضور
CREATE TABLE IF NOT EXISTS public.attendance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  records JSONB NOT NULL DEFAULT '[]', -- [{ "studentId": "...", "present": true }]
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (class_id, date)
);

-- جدول الجدول الدراسي
CREATE TABLE IF NOT EXISTS public.schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  semester INT NOT NULL DEFAULT 1 CHECK (semester IN (1, 2)),
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 4), -- 0=Sunday, 1=Monday, ...
  period_number INT NOT NULL CHECK (period_number BETWEEN 1 AND 8),
  subject TEXT NOT NULL,
  teacher_id UUID REFERENCES public.teachers(id) ON DELETE SET NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (class_id, semester, day_of_week, period_number)
);

-- جدول العلامات
CREATE TABLE IF NOT EXISTS public.grades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  grade DECIMAL(5,2) NOT NULL CHECK (grade >= 0),
  max_grade DECIMAL(5,2) NOT NULL CHECK (max_grade > 0),
  semester TEXT NOT NULL DEFAULT 'first' CHECK (semester IN ('first', 'second')),
  academic_year TEXT NOT NULL DEFAULT (EXTRACT(YEAR FROM NOW())::TEXT),
  exam_type TEXT NOT NULL DEFAULT 'exam' CHECK (exam_type IN ('exam', 'quiz', 'homework', 'project')),
  teacher_id UUID REFERENCES public.teachers(id) ON DELETE SET NULL,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- جدول تعيين المعلمين
CREATE TABLE IF NOT EXISTS public.teacher_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
  grade_id INT NOT NULL CHECK (grade_id BETWEEN 1 AND 12),
  semester TEXT NOT NULL CHECK (semester IN ('first', 'second')),
  subject TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (grade_id, semester, subject)
);

-- جدول ملفات المواد
CREATE TABLE IF NOT EXISTS public.subject_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grade_id INT NOT NULL CHECK (grade_id BETWEEN 1 AND 12),
  semester TEXT NOT NULL CHECK (semester IN ('first', 'second')),
  subject TEXT NOT NULL,
  teacher_id UUID NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  type TEXT NOT NULL CHECK (type IN ('pdf', 'image', 'link', 'document')),
  url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========== إنشاء الفهارس (Indexes) ==========

CREATE INDEX IF NOT EXISTS teachers_name_idx ON public.teachers (name);
CREATE INDEX IF NOT EXISTS teachers_subject_idx ON public.teachers (subject);

CREATE INDEX IF NOT EXISTS classes_teacher_idx ON public.classes (teacher_id);
CREATE INDEX IF NOT EXISTS classes_name_idx ON public.classes (name);

CREATE INDEX IF NOT EXISTS students_class_idx ON public.students (class_id);
CREATE INDEX IF NOT EXISTS students_name_idx ON public.students (name);

CREATE INDEX IF NOT EXISTS attendance_class_idx ON public.attendance_records (class_id);
CREATE INDEX IF NOT EXISTS attendance_date_idx ON public.attendance_records (date);
CREATE INDEX IF NOT EXISTS attendance_class_date_idx ON public.attendance_records (class_id, date);

CREATE INDEX IF NOT EXISTS schedule_class_idx ON public.schedule (class_id);
CREATE INDEX IF NOT EXISTS schedule_teacher_idx ON public.schedule (teacher_id);
CREATE INDEX IF NOT EXISTS schedule_semester_idx ON public.schedule (semester);
CREATE INDEX IF NOT EXISTS schedule_day_idx ON public.schedule (day_of_week);
CREATE INDEX IF NOT EXISTS schedule_period_idx ON public.schedule (period_number);

CREATE INDEX IF NOT EXISTS grades_student_idx ON public.grades (student_id);
CREATE INDEX IF NOT EXISTS grades_subject_idx ON public.grades (subject);
CREATE INDEX IF NOT EXISTS grades_semester_idx ON public.grades (semester);
CREATE INDEX IF NOT EXISTS grades_academic_year_idx ON public.grades (academic_year);

CREATE INDEX IF NOT EXISTS teacher_assignments_teacher_idx ON public.teacher_assignments (teacher_id);
CREATE INDEX IF NOT EXISTS teacher_assignments_grade_idx ON public.teacher_assignments (grade_id);

CREATE INDEX IF NOT EXISTS subject_files_grade_idx ON public.subject_files (grade_id);
CREATE INDEX IF NOT EXISTS subject_files_teacher_idx ON public.subject_files (teacher_id);
CREATE INDEX IF NOT EXISTS subject_files_subject_idx ON public.subject_files (subject);

-- ========== تفعيل Row Level Security (RLS) ==========

ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subject_files ENABLE ROW LEVEL SECURITY;

-- ========== إنشاء سياسات الأمان (Policies) ==========

-- سياسات جدول المعلمين
DROP POLICY IF EXISTS "teachers_select_policy" ON public.teachers;
DROP POLICY IF EXISTS "teachers_insert_policy" ON public.teachers;
DROP POLICY IF EXISTS "teachers_update_policy" ON public.teachers;
DROP POLICY IF EXISTS "teachers_delete_policy" ON public.teachers;

CREATE POLICY "teachers_select_policy" ON public.teachers 
FOR SELECT TO public USING (true);
CREATE POLICY "teachers_insert_policy" ON public.teachers 
FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "teachers_update_policy" ON public.teachers 
FOR UPDATE TO public USING (true);
CREATE POLICY "teachers_delete_policy" ON public.teachers 
FOR DELETE TO public USING (true);

-- سياسات جدول الصفوف
DROP POLICY IF EXISTS "classes_select_policy" ON public.classes;
DROP POLICY IF EXISTS "classes_insert_policy" ON public.classes;
DROP POLICY IF EXISTS "classes_update_policy" ON public.classes;
DROP POLICY IF EXISTS "classes_delete_policy" ON public.classes;

CREATE POLICY "classes_select_policy" ON public.classes 
FOR SELECT TO public USING (true);
CREATE POLICY "classes_insert_policy" ON public.classes 
FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "classes_update_policy" ON public.classes 
FOR UPDATE TO public USING (true);
CREATE POLICY "classes_delete_policy" ON public.classes 
FOR DELETE TO public USING (true);

-- سياسات جدول الطلاب
DROP POLICY IF EXISTS "students_select_policy" ON public.students;
DROP POLICY IF EXISTS "students_insert_policy" ON public.students;
DROP POLICY IF EXISTS "students_update_policy" ON public.students;
DROP POLICY IF EXISTS "students_delete_policy" ON public.students;

CREATE POLICY "students_select_policy" ON public.students 
FOR SELECT TO public USING (true);
CREATE POLICY "students_insert_policy" ON public.students 
FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "students_update_policy" ON public.students 
FOR UPDATE TO public USING (true);
CREATE POLICY "students_delete_policy" ON public.students 
FOR DELETE TO public USING (true);

-- سياسات جدول الحضور
DROP POLICY IF EXISTS "attendance_select_policy" ON public.attendance_records;
DROP POLICY IF EXISTS "attendance_insert_policy" ON public.attendance_records;
DROP POLICY IF EXISTS "attendance_update_policy" ON public.attendance_records;
DROP POLICY IF EXISTS "attendance_delete_policy" ON public.attendance_records;

CREATE POLICY "attendance_select_policy" ON public.attendance_records 
FOR SELECT TO public USING (true);
CREATE POLICY "attendance_insert_policy" ON public.attendance_records 
FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "attendance_update_policy" ON public.attendance_records 
FOR UPDATE TO public USING (true);
CREATE POLICY "attendance_delete_policy" ON public.attendance_records 
FOR DELETE TO public USING (true);

-- سياسات جدول الجدول الدراسي
DROP POLICY IF EXISTS "schedule_select_policy" ON public.schedule;
DROP POLICY IF EXISTS "schedule_insert_policy" ON public.schedule;
DROP POLICY IF EXISTS "schedule_update_policy" ON public.schedule;
DROP POLICY IF EXISTS "schedule_delete_policy" ON public.schedule;

CREATE POLICY "schedule_select_policy" ON public.schedule 
FOR SELECT TO public USING (true);
CREATE POLICY "schedule_insert_policy" ON public.schedule 
FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "schedule_update_policy" ON public.schedule 
FOR UPDATE TO public USING (true);
CREATE POLICY "schedule_delete_policy" ON public.schedule 
FOR DELETE TO public USING (true);

-- سياسات جدول العلامات
DROP POLICY IF EXISTS "grades_select_policy" ON public.grades;
DROP POLICY IF EXISTS "grades_insert_policy" ON public.grades;
DROP POLICY IF EXISTS "grades_update_policy" ON public.grades;
DROP POLICY IF EXISTS "grades_delete_policy" ON public.grades;

CREATE POLICY "grades_select_policy" ON public.grades 
FOR SELECT TO public USING (true);
CREATE POLICY "grades_insert_policy" ON public.grades 
FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "grades_update_policy" ON public.grades 
FOR UPDATE TO public USING (true);
CREATE POLICY "grades_delete_policy" ON public.grades 
FOR DELETE TO public USING (true);

-- سياسات جدول تعيين المعلمين
DROP POLICY IF EXISTS "teacher_assignments_select_policy" ON public.teacher_assignments;
DROP POLICY IF EXISTS "teacher_assignments_insert_policy" ON public.teacher_assignments;
DROP POLICY IF EXISTS "teacher_assignments_update_policy" ON public.teacher_assignments;
DROP POLICY IF EXISTS "teacher_assignments_delete_policy" ON public.teacher_assignments;

CREATE POLICY "teacher_assignments_select_policy" ON public.teacher_assignments 
FOR SELECT TO public USING (true);
CREATE POLICY "teacher_assignments_insert_policy" ON public.teacher_assignments 
FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "teacher_assignments_update_policy" ON public.teacher_assignments 
FOR UPDATE TO public USING (true);
CREATE POLICY "teacher_assignments_delete_policy" ON public.teacher_assignments 
FOR DELETE TO public USING (true);

-- سياسات جدول ملفات المواد
DROP POLICY IF EXISTS "subject_files_select_policy" ON public.subject_files;
DROP POLICY IF EXISTS "subject_files_insert_policy" ON public.subject_files;
DROP POLICY IF EXISTS "subject_files_update_policy" ON public.subject_files;
DROP POLICY IF EXISTS "subject_files_delete_policy" ON public.subject_files;

CREATE POLICY "subject_files_select_policy" ON public.subject_files 
FOR SELECT TO public USING (true);
CREATE POLICY "subject_files_insert_policy" ON public.subject_files 
FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "subject_files_update_policy" ON public.subject_files 
FOR UPDATE TO public USING (true);
CREATE POLICY "subject_files_delete_policy" ON public.subject_files 
FOR DELETE TO public USING (true);

-- ========== منح الصلاحيات ==========

-- منح صلاحيات القراءة للجميع
GRANT SELECT ON public.teachers TO public;
GRANT SELECT ON public.classes TO public;
GRANT SELECT ON public.students TO public;
GRANT SELECT ON public.attendance_records TO public;
GRANT SELECT ON public.schedule TO public;
GRANT SELECT ON public.grades TO public;
GRANT SELECT ON public.teacher_assignments TO public;
GRANT SELECT ON public.subject_files TO public;

-- منح جميع الصلاحيات للمستخدمين الموثقين
GRANT ALL ON public.teachers TO authenticated;
GRANT ALL ON public.classes TO authenticated;
GRANT ALL ON public.students TO authenticated;
GRANT ALL ON public.attendance_records TO authenticated;
GRANT ALL ON public.schedule TO authenticated;
GRANT ALL ON public.grades TO authenticated;
GRANT ALL ON public.teacher_assignments TO authenticated;
GRANT ALL ON public.subject_files TO authenticated;

-- ========== سياسات التخزين (Storage Policies) ==========

-- السماح للمستخدمين الموثقين برفع الملفات
DROP POLICY IF EXISTS "authenticated can upload subject files" ON storage.objects;
DROP POLICY IF EXISTS "public can read subject files" ON storage.objects;

CREATE POLICY "authenticated can upload subject files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'subject-files');

CREATE POLICY "public can read subject files"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'subject-files');

-- ========== تعليقات شرحية ==========

COMMENT ON TABLE public.teachers IS 'جدول المعلمين في المدرسة';
COMMENT ON TABLE public.classes IS 'جدول الصفوف الدراسية';
COMMENT ON TABLE public.students IS 'جدول الطلاب المسجلين';
COMMENT ON TABLE public.attendance_records IS 'سجلات الحضور اليومي للطلاب';
COMMENT ON TABLE public.schedule IS 'الجدول الدراسي الأسبوعي';
COMMENT ON TABLE public.grades IS 'علامات الطلاب في المواد المختلفة';
COMMENT ON TABLE public.teacher_assignments IS 'تعيين المعلمين للصفوف والمواد';
COMMENT ON TABLE public.subject_files IS 'ملفات المواد الدراسية (PDF، صور، روابط)';

COMMENT ON COLUMN public.schedule.semester IS '1=الفصل الأول، 2=الفصل الثاني';
COMMENT ON COLUMN public.schedule.day_of_week IS '0=الأحد، 1=الإثنين، 2=الثلاثاء، 3=الأربعاء، 4=الخميس';
COMMENT ON COLUMN public.schedule.period_number IS 'رقم الحصة من 1 إلى 8';
COMMENT ON COLUMN public.attendance_records.records IS 'مصفوفة JSON تحتوي على سجلات الحضور: [{"studentId": "...", "present": true}]';
COMMENT ON COLUMN public.grades.semester IS 'first=الفصل الأول، second=الفصل الثاني';
COMMENT ON COLUMN public.grades.exam_type IS 'exam=امتحان، quiz=اختبار قصير، homework=واجب، project=مشروع';

-- ========== رسالة نجاح ==========

DO $$
BEGIN
  RAISE NOTICE 'تم إنشاء جميع الجداول والسياسات بنجاح!';
  RAISE NOTICE 'الجداول المنشأة: teachers, classes, students, attendance_records, schedule, grades, teacher_assignments, subject_files';
  RAISE NOTICE 'تم تفعيل RLS على جميع الجداول';
  RAISE NOTICE 'تم منح الصلاحيات اللازمة';
END $$;
