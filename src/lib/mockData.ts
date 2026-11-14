import { UserSession, PatientRecord, ChatSessionForReview } from '@/types/auth';

export const DEMO_ACCOUNTS: UserSession[] = [
  {
    id: 'user-pat-1',
    name: 'Sarah M.',
    email: 'sarah.patient@magdehack.de',
    role: 'patient',
    title: 'Patientin auf Warteliste'
  },
  {
    id: 'user-doc-1',
    name: 'Dr. med. Christian Weber',
    email: 'dr.weber@psychotherapie-magdeburg.de',
    role: 'doctor',
    title: 'Facharzt für Psychiatrie & Psychotherapie',
    clinic: 'Universitätsklinikum Magdeburg'
  },
  {
    id: 'user-prac-1',
    name: 'M.Sc. Elena Becker',
    email: 'elena.becker@oversight-netzwerk.de',
    role: 'practitioner',
    title: 'Klinische Psychologin (Oversight & RLHF Reviewerin)',
    clinic: 'Magdeburger Tele-Interventionsnetz'
  }
];

export const INITIAL_PATIENTS: PatientRecord[] = [
  {
    id: 'pat-101',
    pseudonym: 'P-9842',
    fullName: 'Sarah M. (Pseudonymisiert)',
    age: 26,
    waitWeeks: 14,
    allocatedDate: '24.12.2026',
    riskScore: 0.32,
    severityStatus: 'stabil',
    primaryConcerns: ['Schlafstörungen', 'Grübeln am Abend', 'Prüfungsstress'],
    interactionStyle: 'sanft & validierend',
    totalChats: 18,
    lastActive: 'Vor 2 Stunden',
    hasSummary: true,
    appointmentFastTracked: false,
  },
  {
    id: 'pat-102',
    pseudonym: 'P-5120',
    fullName: 'Tobias K. (Pseudonymisiert)',
    age: 38,
    waitWeeks: 19,
    allocatedDate: '15.01.2027',
    riskScore: 0.74,
    severityStatus: 'dringend',
    primaryConcerns: ['Panikattacken im ÖPNV', 'Verstärkte soziale Isolation', 'Erschöpfung'],
    interactionStyle: 'strukturiert & klar',
    totalChats: 31,
    lastActive: 'Vor 30 Minuten',
    hasSummary: false,
    appointmentFastTracked: false,
  },
  {
    id: 'pat-103',
    pseudonym: 'P-3391',
    fullName: 'Laura S. (Pseudonymisiert)',
    age: 31,
    waitWeeks: 9,
    allocatedDate: '08.03.2027',
    riskScore: 0.48,
    severityStatus: 'beobachten',
    primaryConcerns: ['Anhaltende depressive Verstimmung', 'Antriebsmangel'],
    interactionStyle: 'einfühlsam',
    totalChats: 12,
    lastActive: 'Vor 1 Tag',
    hasSummary: true,
    appointmentFastTracked: false,
  },
  {
    id: 'pat-104',
    pseudonym: 'P-7704',
    fullName: 'Maximilian B. (Pseudonymisiert)',
    age: 44,
    waitWeeks: 22,
    allocatedDate: '02.02.2027',
    riskScore: 0.88,
    severityStatus: 'kritisch',
    primaryConcerns: ['Schwere Grübelschleifen', 'Akuter Rückzug', 'Stimmungseinbruch'],
    interactionStyle: 'direkt & entlastend',
    totalChats: 42,
    lastActive: 'Vor 10 Minuten',
    hasSummary: true,
    appointmentFastTracked: false,
  }
];

export const INITIAL_CHAT_REVIEWS: ChatSessionForReview[] = [
  {
    id: 'review-1',
    patientId: 'pat-102',
    patientPseudonym: 'P-5120',
    patientBaseline: {
      primaryConcerns: ['Panikattacken im ÖPNV', 'Soziale Isolation'],
      interactionStyle: 'strukturiert',
      waitWeeks: 19,
      triggers: ['Menschenmengen', 'Straßenbahn Magdeburg Hbf']
    },
    status: 'pending_review',
    messages: [
      {
        id: 'm1',
        role: 'user',
        content: 'Ich sitze an der Haltestelle und mein Puls rast. Ich traue mich nicht in die Bahn.',
        timestamp: '14:22',
        sentimentScore: -0.7,
      },
      {
        id: 'm2',
        role: 'assistant',
        content: 'Ich verstehe sehr gut, wie beängstigend dieser Moment ist. Sie sind an einem sicheren Ort an der Haltestelle. Versuchen wir gemeinsam die 5-4-3-2-1 Erdung: Nennen Sie mir 5 Dinge, die Sie jetzt gerade um sich herum sehen können.',
        timestamp: '14:23',
        sentimentScore: 0.3,
      },
      {
        id: 'm3',
        role: 'user',
        content: 'Das Schild, die Schienen, ein Baum, eine Straßenlaterne, mein Rucksack. Mein Atem wird etwas ruhiger.',
        timestamp: '14:26',
        sentimentScore: 0.1,
      },
      {
        id: 'm4',
        role: 'assistant',
        content: 'Sehr gut gemacht. Das zeigt, dass Ihr Körper bereits beginnt, den Parasympathikus zu aktivieren. Möchten Sie noch zwei ruhige Atemzüge im 4-7-8 Rhythmus nehmen, bevor Sie entscheiden, ob Sie die nächste Bahn nehmen?',
        timestamp: '14:27',
        sentimentScore: 0.5,
      }
    ]
  },
  {
    id: 'review-2',
    patientId: 'pat-104',
    patientPseudonym: 'P-7704',
    patientBaseline: {
      primaryConcerns: ['Schwere Grübelschleifen', 'Stimmungseinbruch'],
      interactionStyle: 'direkt & entlastend',
      waitWeeks: 22,
      triggers: ['Abendliche Stille', 'Schlafdefizit']
    },
    status: 'pending_review',
    messages: [
      {
        id: 'm10',
        role: 'user',
        content: 'Wieder 3 Uhr nachts. Mein Kopf hört einfach nicht auf zu rattern. Ich fühle mich wie gelähmt.',
        timestamp: '03:12',
        sentimentScore: -0.8,
      },
      {
        id: 'm11',
        role: 'assistant',
        content: 'Es tut mir leid, dass die Nacht so anstrengend für Sie ist. Nächtliches Grübeln ist oft besonders intensiv, weil Reize von außen fehlen. Wäre es für Sie in Ordnung, das Bett für ein paar Minuten zu verlassen und ein Glas Wasser zu trinken, um die Schleife zu unterbrechen?',
        timestamp: '03:13',
        sentimentScore: 0.1,
      }
    ]
  },
  {
    id: 'review-3',
    patientId: 'pat-101',
    patientPseudonym: 'P-9842',
    patientBaseline: {
      primaryConcerns: ['Schlafstörungen', 'Prüfungsstress'],
      interactionStyle: 'sanft & validierend',
      waitWeeks: 14,
      triggers: ['Klausurenphase']
    },
    status: 'closed',
    rating: 5,
    practitionerSummary: 'Der KI-Agent hat die akute Anspannung empathisch aufgefangen, valide psychoedukative Hilfestellung gegeben und die Grenzen zur klinischen Behandlung strikt eingehalten.',
    summaryValidation: {
      isAiAssisted: false,
      confidence: 0.94,
      checkedAt: '14.11.2026 02:40'
    },
    reviewedBy: 'M.Sc. Elena Becker',
    closedAt: '14.11.2026 02:42',
    messages: [
      {
        id: 'm20',
        role: 'user',
        content: 'Ich konnte heute die Atemübung durchführen und habe mich deutlich gefasster gefühlt.',
        timestamp: 'Gestern 18:30',
        sentimentScore: 0.6,
      },
      {
        id: 'm21',
        role: 'assistant',
        content: 'Das freut mich sehr zu hören! Solche kleinen Erfolge sind wichtige Schritte. Halten Sie diesen Moment gern im Gedanken-Tagebuch fest.',
        timestamp: 'Gestern 18:31',
        sentimentScore: 0.8,
      }
    ]
  }
];
