interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function callLLM(messages: LLMMessage[]): Promise<string> {
  const groqApiKey = process.env.GROQ_API_KEY;
  const groqModel = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';

  if (!groqApiKey) {
    throw new Error('No LLM API Key configured. Please set GROQ_API_KEY in .env.local');
  }

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${groqApiKey}`,
      'Content-Type': 'application/json',
      'User-Agent': 'MagdeHack-MentalHealthBridge/1.0',
    },
    body: jsonStringify({
      model: groqModel,
      messages: messages,
      temperature: 0.7,
      max_tokens: 1024,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    // Fallback to qwen if first model has an issue
    if (groqModel !== 'qwen/qwen3.8-27b') {
      const fallbackResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${groqApiKey}`,
          'Content-Type': 'application/json',
        },
        body: jsonStringify({
          model: 'qwen/qwen3.8-27b',
          messages: messages,
          temperature: 0.7,
          max_tokens: 1024,
        }),
      });
      if (fallbackResponse.ok) {
        const fallbackData = await fallbackResponse.json();
        return fallbackData.choices?.[0]?.message?.content || 'Entschuldigung, ich konnte keine Antwort generieren.';
      }
    }
    throw new Error(`LLM Error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || 'Entschuldigung, ich konnte keine Antwort generieren.';
}

function jsonStringify(obj: unknown) {
  return JSON.stringify(obj);
}
