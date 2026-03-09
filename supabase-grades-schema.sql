-- SQL Schema for Grades Table in Supabase
-- Run this in your Supabase SQL Editor

-- Create the grades table
CREATE TABLE IF NOT EXISTS public.grades (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    grade NUMERIC NOT NULL CHECK (grade >= 0),
    max_grade NUMERIC NOT NULL DEFAULT 100 CHECK (max_grade > 0),
    semester TEXT NOT NULL,
    academic_year TEXT NOT NULL,
    exam_type TEXT NOT NULL,
    teacher_id UUID REFERENCES public.teachers(id) ON DELETE SET NULL,
    notes TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow all operations on grades" 
ON public.grades 
FOR ALL 
TO public 
USING (true) 
WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_grades_student_id ON public.grades(student_id);
CREATE INDEX IF NOT EXISTS idx_grades_teacher_id ON public.grades(teacher_id);
CREATE INDEX IF NOT EXISTS idx_grades_academic_year ON public.grades(academic_year);
CREATE INDEX IF NOT EXISTS idx_grades_semester ON public.grades(semester);
CREATE INDEX IF NOT EXISTS idx_grades_subject ON public.grades(subject);
CREATE INDEX IF NOT EXISTS idx_grades_created_at ON public.grades(created_at);

-- Create a view for grade statistics by student
CREATE OR REPLACE VIEW public.student_grade_stats AS
SELECT 
    student_id,
    COUNT(*) as total_grades,
    AVG((grade / max_grade) * 100) as average_percentage,
    MAX((grade / max_grade) * 100) as highest_percentage,
    MIN((grade / max_grade) * 100) as lowest_percentage
FROM public.grades
GROUP BY student_id;

-- Function to get class grades
CREATE OR REPLACE FUNCTION public.get_class_grades(class_id UUID)
RETURNS TABLE (
    grade_id UUID,
    student_id UUID,
    student_name TEXT,
    subject TEXT,
    grade NUMERIC,
    max_grade NUMERIC,
    percentage NUMERIC,
    exam_type TEXT,
    teacher_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        g.id as grade_id,
        g.student_id,
        s.name as student_name,
        g.subject,
        g.grade,
        g.max_grade,
        ROUND((g.grade / g.max_grade) * 100, 2) as percentage,
        g.exam_type,
        t.name as teacher_name,
        g.created_at
    FROM public.grades g
    JOIN public.students s ON g.student_id = s.id
    LEFT JOIN public.teachers t ON g.teacher_id = t.id
    WHERE s.class_id = class_id
    ORDER BY g.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_grades_updated_at
    BEFORE UPDATE ON public.grades
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Grant permissions
GRANT ALL ON public.grades TO public;
GRANT ALL ON public.student_grade_stats TO public;
GRANT EXECUTE ON FUNCTION public.get_class_grades(UUID) TO public;

COMMENT ON TABLE public.grades IS 'Stores student grades and assessment records';
COMMENT ON COLUMN public.grades.exam_type IS 'Type of assessment: كويز, نصف الفصل, أسايمنت, مشاريع, امتحان نهائي, اختبار قصير';
