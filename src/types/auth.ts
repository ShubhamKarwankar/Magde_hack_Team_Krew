export type UserRole = 'patient' | 'doctor' | 'practitioner';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  title?: string;
  clinic?: string;
}

export interface PatientRecord {
  id: string;
  pseudonym: string;
  fullName: string;
  age: number;
  waitWeeks: number;
  allocatedDate: string;
  riskScore: number; // 0.0 - 1.0
  severityStatus: 'stabil' | 'beobachten' | 'dringend' | 'kritisch';
  primaryConcerns: string[];
  interactionStyle: string;
  totalChats: number;
  lastActive: string;
  hasSummary: boolean;
  appointmentFastTracked?: boolean;
}

export interface ChatSessionForReview {
  id: string;
  patientId: string;
  patientPseudonym: string;
  patientBaseline: {
    primaryConcerns: string[];
    interactionStyle: string;
    waitWeeks: number;
    triggers: string[];
  };
  messages: Array<{
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
    sentimentScore?: number;
    crisisFlag?: boolean;
  }>;
  status: 'pending_review' | 'in_review' | 'closed';
  rating?: number; // 1-5 stars
  practitionerSummary?: string;
  summaryValidation?: {
    isAiAssisted: boolean;
    confidence: number;
    checkedAt: string;
  };
  reviewedBy?: string;
  closedAt?: string;
}
