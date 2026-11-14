'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, HeartHandshake, ShieldAlert, Sparkles, RefreshCw, Volume2, VolumeX, Square } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isCrisis?: boolean;
}

export default function ChatView() {
  const { t, language } = useLanguage();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      role: 'assistant',
      content: t.chat.initialGreeting
    }
  ]);

  // Update initial message when language changes if no conversation has taken place yet
  useEffect(() => {
    setMessages(prev => {
      if (prev.length === 1 && prev[0].id === 'init-1') {
        return [{ ...prev[0], content: t.chat.initialGreeting }];
      }
      return prev;
    });
  }, [t.chat.initialGreeting]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [crisisAlert, setCrisisAlert] = useState<string | null>(null);

  // Voice Companion state (ElevenLabs)
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [loadingAudioId, setLoadingAudioId] = useState<string | null>(null);
  const [autoVoice, setAutoVoice] = useState(false);
  const [voiceId, setVoiceId] = useState<string>('pFZP5JQG7iQjIQuC4Bku'); // Lily (warm & soothing)
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCacheRef = useRef<Map<string, string>>(new Map());

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const playVoice = async (messageId: string, text: string) => {
    if (playingId === messageId) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setPlayingId(null);
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    const cacheKey = `${messageId}_${voiceId}`;
    let audioUrl = audioCacheRef.current.get(cacheKey);

    if (!audioUrl) {
      setLoadingAudioId(messageId);
      try {
        const res = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, voiceId }),
        });

        if (!res.ok) {
          throw new Error('TTS request failed');
        }

        const blob = await res.blob();
        audioUrl = URL.createObjectURL(blob);
        audioCacheRef.current.set(cacheKey, audioUrl);
      } catch (err) {
        console.error('Audio playback error:', err);
        setLoadingAudioId(null);
        return;
      } finally {
        setLoadingAudioId(null);
      }
    }

    if (!audioUrl) return;

    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    audio.onended = () => {
      setPlayingId(null);
    };

    audio.onerror = () => {
      setPlayingId(null);
    };

    setPlayingId(messageId);
    audio.play().catch(e => {
      console.warn('Audio play was prevented by browser policy:', e);
      setPlayingId(null);
    });
  };

  const sendMessage = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const textToSend = (customText !== undefined ? customText : input).trim();
    if (!textToSend || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setCrisisAlert(null);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg.content,
          history: messages.slice(-6).map(m => ({ role: m.role, content: m.content })),
          language: language
        })
      });

      const data = await res.json();
      if (data.isCrisis) {
        setCrisisAlert(data.response);
      }

      const assistantMsgId = (Date.now() + 1).toString();
      const assistantResponse = data.response || (language === 'en' ? 'I have received your message.' : 'Ich habe Ihre Nachricht erhalten.');

      setMessages(prev => [
        ...prev,
        {
          id: assistantMsgId,
          role: 'assistant',
          content: assistantResponse,
          isCrisis: data.isCrisis
        }
      ]);

      if (autoVoice && assistantResponse) {
        playVoice(assistantMsgId, assistantResponse);
      }
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: t.chat.connError
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const suggestions = language === 'en' ? [
    'I have trouble sleeping and my mind is racing.',
    'Do you have a quick calming exercise for me?',
    'How should I prepare for my first therapy consultation?'
  ] : [
    'Ich kann abends schwer einschlafen und grüble viel.',
    'Haben Sie eine kurze Beruhigungsübung für mich?',
    'Wie kann ich mich auf das Erstgespräch vorbereiten?'
  ];

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-emerald-100 shadow-sm overflow-hidden">
      {/* Top Bar */}
      <div className="px-6 py-4 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-semibold text-lg shadow-sm">
            C
          </div>
          <div>
            <h2 className="font-semibold text-emerald-950 flex items-center gap-2">
              {t.chat.claraTitle} <span className="text-xs bg-emerald-100 text-emerald-800 font-normal px-2 py-0.5 rounded-full">{t.chat.claraRole}</span>
            </h2>
            <p className="text-xs text-emerald-700">{t.chat.claraSubtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Voice Selector */}
          <select
            value={voiceId}
            onChange={(e) => {
              setVoiceId(e.target.value);
              if (playingId && audioRef.current) {
                audioRef.current.pause();
                setPlayingId(null);
              }
            }}
            className="text-xs bg-white text-emerald-900 border border-emerald-200 rounded-full px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium cursor-pointer"
            title={t.chat.voiceSelect}
          >
            <option value="pFZP5JQG7iQjIQuC4Bku">{t.chat.voiceLily}</option>
            <option value="EXAVITQu4vr4xnSDxMaL">{t.chat.voiceRachel}</option>
            <option value="cgSgspJ2msm6clMCkdW9">{t.chat.voiceGeorge}</option>
          </select>

          {/* Voice Auto-play Toggle Button */}
          <button
            type="button"
            onClick={() => {
              setAutoVoice(!autoVoice);
              if (playingId && audioRef.current) {
                audioRef.current.pause();
                setPlayingId(null);
              }
            }}
            title={autoVoice ? t.chat.autoVoiceOff : t.chat.autoVoiceOn}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
              autoVoice
                ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                : 'bg-white text-emerald-800 border-emerald-200 hover:bg-emerald-100/60'
            }`}
          >
            {autoVoice ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{autoVoice ? (language === 'en' ? 'Voice ON' : 'Stimme aktiv') : (language === 'en' ? 'Mute' : 'Stimme stumm')}</span>
          </button>

          <div className="hidden md:flex items-center gap-1.5 text-xs text-emerald-800 bg-white px-3 py-1.5 rounded-full border border-emerald-200">
            <HeartHandshake className="w-4 h-4 text-emerald-600" />
            <span>{language === 'en' ? 'Safe Space (GDPR)' : 'Geschützter Raum (DSGVO)'}</span>
          </div>
        </div>
      </div>

      {/* Crisis Warning Banner */}
      {crisisAlert && (
        <div className="p-4 bg-rose-50 border-b border-rose-200 text-rose-800 text-sm flex items-start space-x-3">
          <ShieldAlert className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div className="whitespace-pre-line leading-relaxed">{crisisAlert}</div>
        </div>
      )}

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-emerald-50/20 to-white">
        {messages.map((m) => {
          const isClara = m.role === 'assistant';
          const isPlaying = playingId === m.id;
          const isLoadingAudio = loadingAudioId === m.id;

          return (
            <div
              key={m.id}
              className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[78%] rounded-2xl px-5 py-3.5 text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : m.isCrisis
                    ? 'bg-rose-50 text-rose-950 border border-rose-200'
                    : 'bg-emerald-50 text-emerald-950 border border-emerald-100'
                }`}
              >
                <p className="whitespace-pre-line">{m.content}</p>

                {/* ElevenLabs Voice Playback Control for Clara's messages */}
                {isClara && (
                  <div className="mt-2.5 pt-2 border-t border-emerald-200/50 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => playVoice(m.id, m.content)}
                      disabled={isLoadingAudio}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                        isPlaying
                          ? 'bg-emerald-600 text-white shadow-xs animate-pulse'
                          : 'bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-2xs'
                      }`}
                    >
                      {isLoadingAudio ? (
                        <>
                          <RefreshCw className="w-3 h-3 animate-spin text-emerald-600" />
                          <span>{t.chat.audioLoading}</span>
                        </>
                      ) : isPlaying ? (
                        <>
                          <Square className="w-3 h-3 fill-current" />
                          <span>{t.chat.stopAudio}</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3 h-3 text-emerald-600" />
                          <span>{t.chat.listenAudio}</span>
                        </>
                      )}
                    </button>
                    <span className="text-[10px] text-emerald-700/80">
                      {language === 'en' ? 'Clara Voice • Gentle pacing' : 'Clara Audio • Sanfte Pacing'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl px-4 py-3 flex items-center space-x-2 text-emerald-700 text-xs">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
              <span>{language === 'en' ? 'Clara is replying empathetically...' : 'Clara antwortet einfühlsam...'}</span>
            </div>
          </div>
        )}
      </div>

      {/* Suggestion Chips */}
      <div className="px-6 py-2 bg-emerald-50/40 border-t border-emerald-50 flex items-center gap-2 overflow-x-auto text-xs text-emerald-700">
        <Sparkles className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
        <span className="font-medium text-emerald-800">{language === 'en' ? 'Suggestions:' : 'Vorschläge:'}</span>
        {suggestions.map((sug, i) => (
          <button
            key={i}
            onClick={() => setInput(sug)}
            className="whitespace-nowrap px-3 py-1 bg-white hover:bg-emerald-100 border border-emerald-200 rounded-full transition-colors text-emerald-900"
          >
            {sug}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form onSubmit={sendMessage} className="p-4 bg-white border-t border-emerald-100 flex items-center gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t.chat.inputPlaceholder}
          className="flex-1 px-4 py-3 bg-emerald-50/40 border border-emerald-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-emerald-950 placeholder-emerald-800/40"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-medium text-sm flex items-center gap-2 transition-all shadow-sm"
        >
          <span>{t.chat.send}</span>
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
