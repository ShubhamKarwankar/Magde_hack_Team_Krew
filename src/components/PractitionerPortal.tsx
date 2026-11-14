'use client';

import React, { useState } from 'react';
import { UserSession, ChatSessionForReview } from '@/types/auth';
import { INITIAL_CHAT_REVIEWS } from '@/lib/mockData';
import { 
  CheckCircle2, 
  MessageSquare, 
  ShieldCheck, 
  Star, 
  UserCheck, 
  FileCheck, 
  Sparkles,
  Bot,
  User,
  RefreshCw
} from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';

interface PractitionerPortalProps {
  user: UserSession;
}

export default function PractitionerPortal({ user }: PractitionerPortalProps) {
  const { t, language } = useLanguage();
  const [reviews, setReviews] = useState<ChatSessionForReview[]>(INITIAL_CHAT_REVIEWS);
  const [selectedReviewId, setSelectedReviewId] = useState<string>('review-1');
  const [summaryInput, setSummaryInput] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    isAiAssisted: boolean;
    confidence: number;
    verdict?: string;
    reasoning?: string;
  } | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const selectedReview = reviews.find(r => r.id === selectedReviewId)!;

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleValidateSummary = async () => {
    if (!summaryInput.trim()) {
      alert(language === 'en' ? 'Please enter a clinical summary first.' : 'Bitte geben Sie zuerst eine fachliche Zusammenfassung ein.');
      return;
    }

    setValidating(true);
    try {
      const res = await fetch('/api/validate-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ summaryText: summaryInput }),
      });
      const data = await res.json();
      setValidationResult(data);
    } catch {
      alert(language === 'en' ? 'Error validating text origin.' : 'Fehler bei der Validierung des Texts.');
    } finally {
      setValidating(false);
    }
  };

  const handleCloseReview = () => {
    if (!summaryInput.trim()) {
      alert(language === 'en' 
        ? 'Please provide a clinical summary before closing.' 
        : 'Bitte geben Sie vor dem Schließen eine kurze Begründung/Zusammenfassung an.');
      return;
    }

    setReviews(prev => prev.map(r => {
      if (r.id === selectedReviewId) {
        return {
          ...r,
          status: 'closed',
          rating: rating,
          practitionerSummary: summaryInput,
          summaryValidation: validationResult ? {
            isAiAssisted: validationResult.isAiAssisted,
            confidence: validationResult.confidence,
            checkedAt: new Date().toLocaleTimeString(language === 'en' ? 'en-US' : 'de-DE'),
          } : undefined,
          reviewedBy: user.name,
          closedAt: new Date().toLocaleTimeString(language === 'en' ? 'en-US' : 'de-DE'),
        };
      }
      return r;
    }));

    showToast(language === 'en'
      ? `Review for ${selectedReview.patientPseudonym} completed with ${rating} stars & archived.`
      : `Prüfung für ${selectedReview.patientPseudonym} mit ${rating} Sternen abgeschlossen & archiviert.`);
    setSummaryInput('');
    setValidationResult(null);
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-20 right-8 z-50 p-4 bg-emerald-800 text-white rounded-2xl shadow-xl flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-300" />
          <span className="text-sm font-medium">{toastMsg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-emerald-100 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-emerald-950">{t.practitioner.title}</h1>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2.5 py-0.5 rounded-full">
              Part-Time Human-in-the-Loop
            </span>
          </div>
          <p className="text-xs text-emerald-700 mt-1">
            {language === 'en' ? 'Logged in as ' : 'Angemeldet als '}
            <span className="font-semibold">{user.name}</span> • {t.practitioner.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 px-3.5 py-2 rounded-2xl border border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>{language === 'en' ? 'RLHF Feedback Loop Active' : 'RLHF Feedbackschleife aktiv'}</span>
        </div>
      </div>

      {/* Main Grid: Chat Queue (Left) & Detailed Review (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[700px]">
        {/* Left Column: Chat Queue */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-emerald-100 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-emerald-50">
            <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider">{t.practitioner.reviewQueue}</span>
            <span className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              {reviews.filter(r => r.status !== 'closed').length} {language === 'en' ? 'open' : 'offen'}
            </span>
          </div>

          <div className="space-y-3">
            {reviews.map((rev) => {
              const isSelected = rev.id === selectedReviewId;
              const isClosed = rev.status === 'closed';

              return (
                <div
                  key={rev.id}
                  onClick={() => {
                    setSelectedReviewId(rev.id);
                    setSummaryInput(rev.practitionerSummary || '');
                    setRating(rev.rating || 5);
                    setValidationResult(null);
                  }}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-emerald-50/70 border-emerald-500 ring-2 ring-emerald-500/20'
                      : 'bg-white border-emerald-100 hover:border-emerald-200 hover:bg-emerald-50/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-sm text-emerald-950">{rev.patientPseudonym}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      isClosed
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {isClosed ? (language === 'en' ? 'Closed' : 'Abgeschlossen') : (language === 'en' ? 'Pending' : 'Offen')}
                    </span>
                  </div>

                  <p className="text-xs text-emerald-800 line-clamp-1 mb-2">
                    {rev.messages[rev.messages.length - 1]?.content}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-emerald-700">
                    <span>{rev.messages.length} {language === 'en' ? 'messages' : 'Nachrichten'}</span>
                    {rev.rating && (
                      <span className="flex items-center gap-1 text-amber-600 font-bold">
                        <Star className="w-3 h-3 fill-current" /> {rev.rating}/5
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Chat Transcript + Side Context + Review Action */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Top Context Box: Patient Baseline */}
          <div className="bg-white rounded-3xl border border-emerald-100 p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                {language === 'en' ? 'Anchored Profile Context' : 'Verankerter Profil-Kontext'} ({selectedReview.patientPseudonym})
              </span>
              <span className="text-xs text-emerald-700">
                {language === 'en' ? `Week ${selectedReview.patientBaseline.waitWeeks} on waitlist` : `Woche ${selectedReview.patientBaseline.waitWeeks} auf Warteliste`}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
              <div className="p-3 bg-emerald-50/40 rounded-xl border border-emerald-100">
                <span className="font-semibold text-emerald-900 block mb-0.5">{language === 'en' ? 'Symptoms:' : 'Symptomatik:'}</span>
                <span className="text-emerald-800">{selectedReview.patientBaseline.primaryConcerns.join(', ')}</span>
              </div>
              <div className="p-3 bg-emerald-50/40 rounded-xl border border-emerald-100">
                <span className="font-semibold text-emerald-900 block mb-0.5">{language === 'en' ? 'Interaction Style:' : 'Interaktionsstil:'}</span>
                <span className="text-emerald-800">{selectedReview.patientBaseline.interactionStyle}</span>
              </div>
              <div className="p-3 bg-emerald-50/40 rounded-xl border border-emerald-100">
                <span className="font-semibold text-emerald-900 block mb-0.5">{language === 'en' ? 'Known Triggers:' : 'Bekannte Trigger:'}</span>
                <span className="text-emerald-800">{selectedReview.patientBaseline.triggers.join(', ')}</span>
              </div>
            </div>
          </div>

          {/* Chat Transcript View */}
          <div className="bg-white rounded-3xl border border-emerald-100 shadow-sm flex flex-col h-80 overflow-hidden">
            <div className="px-5 py-3 bg-emerald-50/60 border-b border-emerald-100 flex items-center justify-between text-xs text-emerald-800 font-semibold">
              <span className="flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                {t.practitioner.chatHistory}
              </span>
              <span>{language === 'en' ? 'Pseudonymized log' : 'Pseudonymisierter Mitschnitt'}</span>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-3.5 bg-gradient-to-b from-emerald-50/10 to-white">
              {selectedReview.messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-emerald-50 text-emerald-950 border border-emerald-100'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4 mb-1 text-[10px] opacity-75">
                      <span className="font-semibold">{m.role === 'user' ? (language === 'en' ? 'Patient' : 'Patient') : (language === 'en' ? 'AI Clara' : 'KI Clara')}</span>
                      <span>{m.timestamp}</span>
                    </div>
                    <p className="whitespace-pre-line">{m.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Practitioner Review Box */}
          <div className="bg-white rounded-3xl border border-emerald-100 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                {t.practitioner.aiResponseVerification}
              </h3>
              {selectedReview.status === 'closed' && (
                <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full">
                  ✓ {language === 'en' ? 'Approved & signed by ' : 'Abgeschlossen & signiert von '} {selectedReview.reviewedBy}
                </span>
              )}
            </div>

            {/* Star Rating Selection */}
            <div>
              <label className="block text-xs font-semibold text-emerald-900 mb-1.5">
                {t.practitioner.ratingLabel}:
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    disabled={selectedReview.status === 'closed'}
                    onClick={() => setRating(s)}
                    className={`p-2 rounded-xl transition-all ${
                      rating >= s
                        ? 'text-amber-500 bg-amber-50'
                        : 'text-gray-300 bg-gray-50'
                    }`}
                  >
                    <Star className="w-5 h-5 fill-current" />
                  </button>
                ))}
                <span className="text-xs text-emerald-700 ml-2 font-medium">
                  {rating === 5 && (language === 'en' ? 'Excellent clinical boundary & empathy' : 'Exzellente klinische Begrenzung & Empathie')}
                  {rating === 4 && (language === 'en' ? 'Good, safe interaction' : 'Gute, sichere Interaktion')}
                  {rating === 3 && (language === 'en' ? 'Acceptable, phrasing needs improvement' : 'Akzeptabel, Formulierung verbesserungswürdig')}
                  {rating <= 2 && (language === 'en' ? 'Deficient or potential boundary violation' : 'Mangelhaft oder potenzielle Grenzverletzung')}
                </span>
              </div>
            </div>

            {/* Practitioner Summary Input */}
            <div>
              <label className="block text-xs font-semibold text-emerald-900 mb-1.5">
                {t.practitioner.summaryLabel}:
              </label>
              <textarea
                rows={3}
                disabled={selectedReview.status === 'closed'}
                value={summaryInput}
                onChange={(e) => setSummaryInput(e.target.value)}
                placeholder={t.practitioner.summaryPlaceholder}
                className="w-full p-3.5 bg-emerald-50/30 border border-emerald-200 rounded-2xl text-xs text-emerald-950 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* AI vs Human Validation Box */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <button
                type="button"
                disabled={validating || !summaryInput.trim() || selectedReview.status === 'closed'}
                onClick={handleValidateSummary}
                className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 disabled:opacity-50 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 border border-emerald-200 transition-colors"
              >
                {validating ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                )}
                <span>{t.practitioner.validateAiBtn}</span>
              </button>

              {validationResult && (
                <div className={`text-xs px-3.5 py-1.5 rounded-xl border flex items-center gap-2 ${
                  validationResult.isAiAssisted
                    ? 'bg-amber-50 text-amber-900 border-amber-200'
                    : 'bg-emerald-50 text-emerald-900 border-emerald-200'
                }`}>
                  {validationResult.isAiAssisted ? (
                    <Bot className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  ) : (
                    <User className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  )}
                  <span>
                    <strong>{language === 'en' ? 'Result:' : 'Ergebnis:'}</strong> {validationResult.verdict} ({(validationResult.confidence * 100).toFixed(0)}% {language === 'en' ? 'confidence' : 'Konfidenz'})
                  </span>
                </div>
              )}
            </div>

            {/* Final Action Button */}
            {selectedReview.status !== 'closed' && (
              <div className="pt-2 border-t border-emerald-100 flex justify-end">
                <button
                  type="button"
                  onClick={handleCloseReview}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-md shadow-emerald-600/20"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{t.practitioner.approveAndCloseBtn}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
