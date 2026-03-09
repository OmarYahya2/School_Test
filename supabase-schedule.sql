-- SQL Schema for Schedule Table
-- Run this in your Supabase SQL Editor

-- Create schedule table
CREATE TABLE IF NOT EXISTS public.schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  semester INT NOT NULL DEFAULT 1 CHECK (semester IN (1, 2)),
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 4),
  period_number INT NOT NULL CHECK (period_number BETWEEN 1 AND 8),
  subject TEXT NOT NULL,
  teacher_id UUID REFERENCES public.teachers(id) ON DELETE SET NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (class_id, semester, day_of_week, period_number)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS schedule_class_id_idx ON public.schedule (class_id);
CREATE INDEX IF NOT EXISTS schedule_teacher_id_idx ON public.schedule (teacher_id);
CREATE INDEX IF NOT EXISTS schedule_day_idx ON public.schedule (day_of_week);
CREATE INDEX IF NOT EXISTS schedule_semester_idx ON public.schedule (semester);

-- Enable Row Level Security
ALTER TABLE public.schedule ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any (to avoid conflicts)
DROP POLICY IF EXISTS "Allow select schedule for all" ON public.schedule;
DROP POLICY IF EXISTS "Allow insert schedule for authenticated" ON public.schedule;
DROP POLICY IF EXISTS "Allow update schedule for authenticated" ON public.schedule;
DROP POLICY IF EXISTS "Allow delete schedule for authenticated" ON public.schedule;

-- Create policies
CREATE POLICY "Allow select schedule for all" 
ON public.schedule FOR SELECT TO public USING (true);

CREATE POLICY "Allow insert schedule for authenticated" 
ON public.schedule FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow update schedule for authenticated" 
ON public.schedule FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow delete schedule for authenticated" 
ON public.schedule FOR DELETE TO authenticated USING (true);

-- Grant permissions
GRANT ALL ON public.schedule TO public;

-- Comments
COMMENT ON TABLE public.schedule IS 'School weekly schedule - with semester support';
COMMENT ON COLUMN public.schedule.semester IS '1=First Semester, 2=Second Semester';
COMMENT ON COLUMN public.schedule.day_of_week IS '0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday';
COMMENT ON COLUMN public.schedule.period_number IS 'Period number from 1 to 8';

