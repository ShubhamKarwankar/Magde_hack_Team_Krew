export type Role = 'patient' | 'practitioner' | 'admin';

export interface Profile {
  id: string;
  role: Role;
  full_name: string;
  email?: string;
  created_at: string;
}

export interface PatientProfile {
  id: string;
  user_id: string;
  primary_concerns: string[];
  daily_routine: Record<string, unknown>;
  interaction_style: 'gentle' | 'direct' | 'neutral' | 'structured';
  triggers: string[];
  coping_mechanisms: string[];
  waitlist_duration_weeks: number;
  profiling_complete: boolean;
  created_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  sentiment_score?: number;
  crisis_flag?: boolean;
  feedback_rating?: number;
  created_at: string;
}

export interface MoodEntry {
  id: string;
  user_id: string;
  mood_score: number;
  anxiety_score: number;
  sleep_quality: number;
  energy_level: number;
  notes?: string;
  created_at: string;
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  category: 'breathing' | 'grounding' | 'psychoeducation' | 'journaling' | 'mindfulness';
  duration_minutes: number;
  time_of_day: 'morning' | 'afternoon' | 'evening' | 'anytime';
  target_concerns: string[];
  content?: Record<string, unknown>;
}

export interface RiskScore {
  id: string;
  user_id: string;
  score: number;
  risk_level: 'low' | 'medium' | 'high' | 'crisis';
  factors: Record<string, unknown>;
  generated_at: string;
}

export interface PreAppointmentSummary {
  id: string;
  user_id: string;
  ai_summary: string;
  clinical_highlights: Record<string, unknown>;
  practitioner_approved: boolean;
  review_notes?: string;
  created_at: string;
}
