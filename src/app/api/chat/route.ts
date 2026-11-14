import { NextRequest, NextResponse } from 'next/server';
import { callLLM } from '@/lib/llm';
import { evaluateGuardrails } from '@/lib/guardrails';
import { supabase } from '@/lib/supabase';

const SYSTEM_PROMPT_DE = `Du bist "Clara", eine einfühlsame, unterstützende digitale Begleiterin für Patientinnen und Patienten in Deutschland, die auf einen Psychotherapieplatz warten.
Deine Kernziele:
1. Empathisches, aktives Zuhören und Entlastung im Alltag bieten.
2. KEINE Diagnosen stellen, KEINE Medikamente empfehlen und betonen, dass du eine Überbrückungshilfe vor der eigentlichen Therapie bist.
3. Sanfte Coping-Strategien (Atemübungen, Erdungstechniken, Strukturierung des Tages) anbieten, wenn der Patient danach fragt.
4. Immer in einem warmen, respektvollen und beruhigenden Tonfall antworten (Deutsch, "Sie" oder "Du" je nach Wunsch, standardmäßig wertschätzendes "Sie").
5. Antworten prägnant, verständlich und nicht überwältigend halten (maximal 2-3 kurze Absätze).`;

const SYSTEM_PROMPT_EN = `You are "Clara", an empathetic, supportive digital companion for patients waiting for psychotherapy.
Your core objectives:
1. Provide empathetic, active listening and day-to-day emotional relief.
2. DO NOT make diagnoses, DO NOT prescribe or recommend medications, and clarify that you are a bridging support while waiting for psychotherapy.
3. Offer gentle coping strategies (breathing exercises, 5-4-3-2-1 grounding, routine structuring) when the user asks or seems distressed.
4. Always respond in a warm, respectful, and soothing tone in English.
5. Keep responses concise, clear, and reassuring (maximum 2-3 short paragraphs).`;

export async function POST(req: NextRequest) {
  try {
    const { message, conversationId, history = [], userProfile, language = 'de' } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // 1. Guardrail evaluation
    const guardrail = evaluateGuardrails(message);

    if (guardrail.isCrisis) {
      const crisisText = language === 'en'
        ? `⚠️ IMPORTANT SAFETY NOTICE: It seems you are going through a critical moment right now. Please remember that you are not alone.\n\nFor immediate, free, and confidential crisis support available 24/7:\n• National Emergency Line: 112 (or 911 / 988)\n• Crisis Helpline: 0800 111 0 111 or 0800 111 0 222\n• Depression Support Hotline: 0800 33 44 533\n\nAs your digital companion, I am here for bridging support, but I cannot replace professional medical or crisis intervention.`
        : guardrail.crisisMessage;

      // If DB conversationId provided, record message
      if (conversationId) {
        await supabase.from('messages').insert([
          { conversation_id: conversationId, role: 'user', content: message, sentiment_score: guardrail.sentimentScore, crisis_flag: true },
          { conversation_id: conversationId, role: 'assistant', content: crisisText, crisis_flag: true }
        ]);
      }

      return NextResponse.json({
        response: crisisText,
        isCrisis: true,
        sentimentScore: guardrail.sentimentScore,
      });
    }

    // 2. Build conversation context for LLM
    let profileContext = '';
    if (userProfile) {
      profileContext = language === 'en'
        ? `\n[Patient Context: Primary concerns: ${userProfile.primary_concerns?.join(', ') || 'Not specified'}; Interaction style: ${userProfile.interaction_style || 'gentle'}]`
        : `\n[Patienten-Kontext: Hauptanliegen: ${userProfile.primary_concerns?.join(', ') || 'Nicht angegeben'}; Interaktionsstil: ${userProfile.interaction_style || 'sanft'}]`;
    }

    const basePrompt = language === 'en' ? SYSTEM_PROMPT_EN : SYSTEM_PROMPT_DE;

    const messagesPayload = [
      { role: 'system' as const, content: basePrompt + profileContext },
      ...history.slice(-8).map((h: { role: string; content: string }) => ({
        role: (h.role === 'assistant' ? 'assistant' : 'user') as 'user' | 'assistant',
        content: h.content,
      })),
      { role: 'user' as const, content: message },
    ];

    // 3. Call LLM
    const aiResponse = await callLLM(messagesPayload);

    // 4. Save to Supabase if conversationId is provided
    if (conversationId) {
      try {
        await supabase.from('messages').insert([
          { conversation_id: conversationId, role: 'user', content: message, sentiment_score: guardrail.sentimentScore, crisis_flag: false },
          { conversation_id: conversationId, role: 'assistant', content: aiResponse, crisis_flag: false }
        ]);
      } catch (err) {
        console.warn('DB logging warning (table might be empty or not yet created):', err);
      }
    }

    return NextResponse.json({
      response: aiResponse,
      isCrisis: false,
      sentimentScore: guardrail.sentimentScore,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    console.error('Chat API Error:', errorMsg);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
