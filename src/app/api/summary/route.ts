import { NextRequest, NextResponse } from 'next/server';
import { callLLM } from '@/lib/llm';

export async function POST(req: NextRequest) {
  try {
    const { patientProfile, moodHistory = [], messageCount = 0 } = await req.json();

    const prompt = `Als klinischer Assistenz-Algorithmus erstelle einen strukturierten, 1-seitigen Vorab-Konsultationsbericht (Pre-Appointment Clinical Brief) für den behandelnden Psychotherapeuten/Facharzt in Deutschland.

Patienten-Daten:
- Hauptanliegen: ${patientProfile?.primary_concerns?.join(', ') || 'Schlafstörungen, Erschöpfung, Angst'}
- Interaktionspräferenz: ${patientProfile?.interaction_style || 'sanft'}
- Bisherige Wartezeit: ${patientProfile?.waitlist_duration_weeks || 12} Wochen
- Interaktionsvolumen: ${messageCount} Dialoge
- Kürzliche Stimmungswerte (1-10): ${moodHistory.map((m: { mood_score: number }) => m.mood_score).join(', ') || '4, 5, 3, 4, 6'}

Erstelle den Bericht in klarem klinischem Deutsch mit folgenden Abschnitten:
1. Zusammenfassende Einschätzung der Wartezeit-Dynamik
2. Primäre Belastungsthemen und identifizierte Stressoren
3. Beobachtete Ressourcen & Coping-Strategien
4. Relevante Beobachtungen für das Erstgespräch
5. Vorläufige Risikoeinschätzung

Halte den Bericht sachlich, präzise und für ein schnelles Einlesen vor der Sitzung optimiert.`;

    const summary = await callLLM([
      { role: 'system', content: 'Du bist ein erfahrener psychologischer Gutachter und Assistent für klinische Falldokumentationen.' },
      { role: 'user', content: prompt }
    ]);

    return NextResponse.json({ summary });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
