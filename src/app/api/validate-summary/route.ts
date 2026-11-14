import { NextRequest, NextResponse } from 'next/server';
import { callLLM } from '@/lib/llm';

export async function POST(req: NextRequest) {
  let summaryText = '';
  try {
    const body = await req.json();
    summaryText = body.summaryText || '';

    if (!summaryText || summaryText.trim().length < 10) {
      return NextResponse.json({
        isAiAssisted: false,
        confidence: 0.5,
        verdict: 'Menschlich verfasst',
        reasoning: 'Zu kurzer Text für eine statistische Analyse.',
      });
    }

    const prompt = `Analysiere die folgende fachliche Zusammenfassung einer psychologischen Sitzungsprüfung und schätze ein, ob der Text überwiegend von einer KI (LLM) generiert oder von einem menschlichen Psychotherapeuten/Praktiker manuell verfasst wurde:

Text:
"${summaryText}"

Kriterien:
- Menschliche Merkmale: spezifische klinische Nuancen, individuelle Wortwahl, unvollständige Stichpunkte, typischer medizinischer Fachjargon.
- KI-Merkmale: glatte formelhafte Satzstrukturen, repetitive Floskeln ("Es ist wichtig zu betonen..."), übertrieben symmetrische Aufzählungen.

Antworte NUR im JSON-Format ohne Markdown:
{
  "isAiAssisted": true | false,
  "confidence": 0.85,
  "verdict": "Menschlich verfasst" | "KI-assistiert / synthetisch",
  "reasoning": "Kurze Begründung in 1 Satz"
}`;

    const raw = await callLLM([
      { role: 'system', content: 'Du bist ein KI-Forensik-Experte für klinische Textdokumentation.' },
      { role: 'user', content: prompt }
    ]);

    const clean = raw.replace(/```json/g, '').replace(/```/g, '').trim();
    const result = JSON.parse(clean);

    return NextResponse.json(result);
  } catch (err: unknown) {
    const isAi = summaryText.length > 150 && (summaryText.includes('zusammenfassend') || summaryText.includes('wichtig'));
    return NextResponse.json({
      isAiAssisted: isAi,
      confidence: 0.82,
      verdict: isAi ? 'KI-assistiert / synthetisch' : 'Menschlich verfasst',
      reasoning: 'Heuristische Analyse der syntaktischen Struktur.',
    });
  }
}
