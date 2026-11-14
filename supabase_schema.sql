-- =========================================================================
-- MagdeHack: Mental Health Bridge Platform (Therapy Waitlist Companion)
-- Run this in the Supabase Dashboard -> SQL Editor
-- =========================================================================

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table (syncs with auth.users or standalone demo users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role TEXT NOT NULL CHECK (role IN ('patient', 'practitioner', 'admin')) DEFAULT 'patient',
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Patient Profiles (Clinical Intake, baseline, preferences)
CREATE TABLE IF NOT EXISTS public.patient_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  primary_concerns TEXT[] DEFAULT '{}',
  daily_routine JSONB DEFAULT '{}'::jsonb,
  interaction_style TEXT DEFAULT 'gentle' CHECK (interaction_style IN ('direct', 'gentle', 'neutral', 'structured')),
  triggers TEXT[] DEFAULT '{}',
  coping_mechanisms TEXT[] DEFAULT '{}',
  waitlist_duration_weeks INT DEFAULT 0,
  profiling_complete BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Conversations (Chat Sessions)
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT DEFAULT 'Unterstützungs-Gespräch',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'flagged')),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Messages (Transcripts with Guardrails & Sentiment)
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  sentiment_score FLOAT DEFAULT 0.0,
  crisis_flag BOOLEAN DEFAULT false,
  feedback_rating INT CHECK (feedback_rating BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Mood & Vital Check-Ins (Daily longitudinal telemetry)
CREATE TABLE IF NOT EXISTS public.mood_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  mood_score INT CHECK (mood_score BETWEEN 1 AND 10) NOT NULL,
  anxiety_score INT CHECK (anxiety_score BETWEEN 1 AND 10) DEFAULT 5,
  sleep_quality INT CHECK (sleep_quality BETWEEN 1 AND 10) DEFAULT 5,
  energy_level INT CHECK (energy_level BETWEEN 1 AND 10) DEFAULT 5,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Engagement Library & Scheduled Activities
CREATE TABLE IF NOT EXISTS public.activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('breathing', 'grounding', 'psychoeducation', 'journaling', 'mindfulness')),
  duration_minutes INT DEFAULT 5,
  time_of_day TEXT DEFAULT 'anytime' CHECK (time_of_day IN ('morning', 'afternoon', 'evening', 'anytime')),
  target_concerns TEXT[] DEFAULT '{}',
  content JSONB DEFAULT '{}'::jsonb
);

-- 7. Patient Activity Log
CREATE TABLE IF NOT EXISTS public.activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  activity_id UUID REFERENCES public.activities(id) ON DELETE SET NULL,
  completed BOOLEAN DEFAULT true,
  user_reflection TEXT,
  completed_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Clinical Severity / Risk Scoring
CREATE TABLE IF NOT EXISTS public.risk_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  score FLOAT NOT NULL CHECK (score BETWEEN 0.0 AND 1.0),
  risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'medium', 'high', 'crisis')),
  factors JSONB DEFAULT '{}'::jsonb,
  generated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. Pre-Appointment Summary for Primary Clinics
CREATE TABLE IF NOT EXISTS public.summaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  ai_summary TEXT NOT NULL,
  clinical_highlights JSONB DEFAULT '{}'::jsonb,
  practitioner_approved BOOLEAN DEFAULT false,
  reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  review_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Seed initial activities for German healthcare waitlist context
INSERT INTO public.activities (title, description, category, duration_minutes, time_of_day, target_concerns, content)
VALUES
(
  '4-7-8 Atemübung zur Beruhigung',
  'Eine wissenschaftlich fundierte Atemtechnik zur schnellen Reduktion akuter Angst- und Unruhezustände.',
  'breathing',
  5,
  'evening',
  ARRAY['anxiety', 'sleep_issues', 'stress'],
  '{"steps": ["4 Sekunden durch die Nase einatmen", "7 Sekunden den Atem halten", "8 Sekunden langsam durch den Mund ausatmen", "4 Zyklen wiederholen"]}'::jsonb
),
(
  '5-4-3-2-1 Sinnes-Erdung',
  'Schnelle Orientierung im Hier und Jetzt bei aufkommenden Panik- oder Überforderungsgefühlen.',
  'grounding',
  4,
  'anytime',
  ARRAY['anxiety', 'panic', 'overwhelm'],
  '{"steps": ["5 Dinge sehen", "4 Dinge berühren", "3 Geräusche hören", "2 Gerüche wahrnehmen", "1 Geschmack schmecken"]}'::jsonb
),
(
  'Psychoedukation: Das vegetative Nervensystem',
  'Verstehen, wie Sympathikus und Parasympathikus Ihre körperlichen Symptome im Alltag steuern.',
  'psychoeducation',
  7,
  'morning',
  ARRAY['stress', 'fatigue', 'general'],
  '{"summary": "Warum Herzrasen und innere Unruhe natürliche Reaktionen des Körpers sind und wie man sie sanft reguliert."}'::jsonb
),
(
  'Gedanken-Entlastungstagebuch',
  'Geleitete Reflexion zur Entlastung des Arbeitsgedächtnisses vor dem Einschlafen.',
  'journaling',
  6,
  'evening',
  ARRAY['sleep_issues', 'rumination'],
  '{"prompts": ["Was hat heute Energie gekostet?", "Was war heute neutral oder angenehm?", "Was kann bis morgen warten?"]}'::jsonb
)
ON CONFLICT DO NOTHING;
