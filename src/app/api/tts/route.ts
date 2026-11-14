import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { text, voiceId } = await req.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'ElevenLabs API key not configured' }, { status: 500 });
    }

    // Default to Lily (warm, soothing, empathetic therapy voice) or Sarah
    const selectedVoice = voiceId || process.env.ELEVENLABS_VOICE_ID || 'pFZP5JQG7iQjIQuC4Bku';

    // Clean up text (strip system prefixes, excessive whitespace)
    const cleanText = text
      .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}]/gu, '')
      .trim();

    if (!cleanText) {
      return NextResponse.json({ error: 'No valid text to speak' }, { status: 400 });
    }

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${selectedVoice}`, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg',
      },
      body: JSON.stringify({
        text: cleanText,
        model_id: 'eleven_turbo_v2_5', // ElevenLabs conversational AI engine with realistic human inflection
        voice_settings: {
          stability: 0.38, // Lower stability allows natural human pitch variations, pauses, and breathiness
          similarity_boost: 0.75,
          style: 0.40, // Adds conversational warmth & empathy instead of flat robotic reading
          use_speaker_boost: true,
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('ElevenLabs TTS error:', response.status, errText);
      return NextResponse.json(
        { error: 'Failed to generate voice speech', details: errText },
        { status: response.status }
      );
    }

    // Stream the audio binary back
    const audioBuffer = await response.arrayBuffer();

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString(),
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Error in /api/tts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
