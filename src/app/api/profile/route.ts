import { NextRequest, NextResponse } from 'next/server';
import { callLLM } from '@/lib/llm';

export async function POST(req: NextRequest) {
  try {
    const { transcript } = await req.json();

    const prompt = `Analysiere den folgenden kurzen Erstkontakt mit dem Patienten und extrahiere strukturierte Profilinformationen im JSON-Format:

Dialog:
${transcript}

Antworte NUR mit einem validen JSON-Objekt ohne Markdown-Backticks:
{
  "primary_concerns": ["z.B. Schlafstörungen", "Prüfungsangst"],
  "interaction_style": "gentle" | "direct" | "structured",
  "triggers": ["z.B. Leistungsdruck", "Abendliche Einsamkeit"],
  "coping_mechanisms": ["z.B. Spazierengehen", "Musik hören"],
  "summary": "1 prägnanter Satz über den Zustand"
}`;

    const rawResponse = await callLLM([
      { role: 'system', content: 'Du bist ein KI-Assistent, der psychologische Intake-Daten präzise in JSON parst.' },
      { role: 'user', content: prompt }
    ]);

    // Clean JSON if backticks present
    const cleanJson = rawResponse.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson);

    return NextResponse.json({ profile: parsed });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
