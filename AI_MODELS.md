# AI Models Used

## LLM (Large Language Model)
- **Provider:** Groq
- **Model:** `openai/gpt-oss-120b` (default, set via `GROQ_MODEL` in `.env`)
- **Fallback:** If the Groq request fails, the code falls back to the **Qwen** model (`Qwen-7b`) as a secondary option.
- **Usage:** Generates conversation summaries and validates summaries against the original chat.

## Text‑to‑Speech (Voice)
- **Provider:** ElevenLabs
- **Voice ID:** Configurable via `ELEVENLABS_VOICE_ID` (default example uses `eleven_turbo_v2_5`).
- **API:** `ELEVENLABS_API_KEY` is required to call the ElevenLabs TTS endpoint.
- **Usage:** Reads out chat messages so users can listen to AI responses.

## Other services
- **Supabase (optional):** Handles authentication and user data storage (`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
- **Gemini:** Not used in this project; all LLM calls go through Groq.

---
*Documentation added during the MagdeHack hackathon.*