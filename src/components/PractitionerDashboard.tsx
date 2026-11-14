'use client';

import React, { useState } from 'react';
import { UserCheck, FileText, AlertTriangle, CheckCircle, Activity, Download, RefreshCw } from 'lucide-react';

interface PatientOverview {
  id: string;
  name: string;
  pseudonym: string;
  waitWeeks: number;
  riskScore: number;
  riskCategory: 'low' | 'medium' | 'high';
  primaryIssue: string;
  interactionsCount: number;
}

export default function PractitionerDashboard() {
  const [selectedPatient, setSelectedPatient] = useState<PatientOverview>({
    id: 'pat-104',
    name: 'Patient #104 (Anonymisiert)',
    pseudonym: 'P-9842',
    waitWeeks: 14,
    riskScore: 0.32,
    riskCategory: 'low',
    primaryIssue: 'Schlafstörungen & Generalisierte Anspannung',
    interactionsCount: 18,
  });

  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [summaryText, setSummaryText] = useState<string | null>(null);

  const handleGenerateSummary = async () => {
    setGeneratingSummary(true);
    try {
      const res = await fetch('/api/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientProfile: {
            primary_concerns: ['Schlafstörungen', 'Innere Unruhe am Abend', 'Arbeitsüberlastung'],
            interaction_style: 'sanft',
            waitlist_duration_weeks: selectedPatient.waitWeeks,
          },
          moodHistory: [{ mood_score: 4 }, { mood_score: 5 }, { mood_score: 4 }, { mood_score: 6 }, { mood_score: 5 }],
          messageCount: selectedPatient.interactionsCount,
        }),
      });
      const data = await res.json();
      setSummaryText(data.summary || 'Zusammenfassung erfolgreich erstellt.');
    } catch {
      setSummaryText('Fehler beim Abruf des klinischen Vorab-Berichts.');
    } finally {
      setGeneratingSummary(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-emerald-100 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-emerald-950">Fachärztliches Oversight-Dashboard</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
              Human-in-the-Loop
            </span>
          </div>
          <p className="text-xs text-emerald-700 mt-1">
            Überwachung der KI-Interaktionen, Schweregrad-Triage & Vorab-Berichte für Erstgespräche
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleGenerateSummary}
            disabled={generatingSummary}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-sm"
          >
            {generatingSummary ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <FileText className="w-4 h-4" />
            )}
            <span>Vorab-Konsultationsbericht generieren</span>
          </button>
        </div>
      </div>

      {/* Patient Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100">
          <span className="text-xs text-emerald-800 font-medium">Patienten-ID</span>
          <div className="text-base font-bold text-emerald-950 mt-1">{selectedPatient.pseudonym}</div>
          <span className="text-[11px] text-emerald-700">DSGVO Pseudonymisierung aktiv</span>
        </div>

        <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100">
          <span className="text-xs text-emerald-800 font-medium">Bisherige Wartezeit</span>
          <div className="text-base font-bold text-emerald-950 mt-1">{selectedPatient.waitWeeks} Wochen</div>
          <span className="text-[11px] text-emerald-700">Ersttermin avisiert in 6 Wochen</span>
        </div>

        <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100">
          <span className="text-xs text-emerald-800 font-medium">KI-Schweregrad-Score</span>
          <div className="text-base font-bold text-emerald-700 mt-1 flex items-center gap-2">
            <span>{(selectedPatient.riskScore * 100).toFixed(0)}%</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              Niedrig (Stabil)
            </span>
          </div>
          <span className="text-[11px] text-emerald-700">Keine Krisen-Trigger detektiert</span>
        </div>

        <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100">
          <span className="text-xs text-emerald-800 font-medium">Begleitungs-Aktivität</span>
          <div className="text-base font-bold text-emerald-950 mt-1">{selectedPatient.interactionsCount} Kontakte</div>
          <span className="text-[11px] text-emerald-700">Regelmäßige Stimmungs-Telemetrie</span>
        </div>
      </div>

      {/* Baseline Clinical Profile Context Box */}
      <div className="p-4 rounded-xl border border-emerald-200 bg-white space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-emerald-600" />
            Anker-Profil (Erstprofiling bei Anmeldung)
          </h4>
          <span className="text-xs text-emerald-700 font-medium">Validiert durch intake-bot</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-emerald-50/30 rounded-lg border border-emerald-100">
            <span className="font-semibold text-emerald-900 block mb-1">Primärsymptome:</span>
            <p className="text-emerald-800">Schlafstörungen, Verspannung, Erschöpfungsgefühl</p>
          </div>
          <div className="p-3 bg-emerald-50/30 rounded-lg border border-emerald-100">
            <span className="font-semibold text-emerald-900 block mb-1">Bevorzugter Stil:</span>
            <p className="text-emerald-800">Einfühlsam, validierend, schrittweise Entlastung</p>
          </div>
          <div className="p-3 bg-emerald-50/30 rounded-lg border border-emerald-100">
            <span className="font-semibold text-emerald-900 block mb-1">Interventions-Frequenz:</span>
            <p className="text-emerald-800">2-3 wöchentliche Check-ins, sanftes Abend-Pacing</p>
          </div>
        </div>
      </div>

      {/* Generated Clinical Summary Modal/View */}
      {summaryText && (
        <div className="p-5 rounded-xl border border-emerald-300 bg-emerald-50/30 space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-emerald-950 text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              Generierter Vorab-Konsultationsbericht (Pre-Appointment Brief)
            </h3>
            <button
              onClick={() => alert('Bericht wurde als PDF für das Praxisverwaltungssystem exportiert.')}
              className="text-xs font-semibold px-3 py-1.5 bg-white border border-emerald-300 hover:bg-emerald-100 rounded-lg text-emerald-800 flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Exportieren (PDF/FHIR)</span>
            </button>
          </div>

          <div className="p-4 bg-white rounded-lg border border-emerald-100 text-xs text-emerald-950 whitespace-pre-line leading-relaxed max-h-96 overflow-y-auto">
            {summaryText}
          </div>

          <div className="flex items-center justify-between text-xs text-emerald-700 pt-2 border-t border-emerald-100">
            <span className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              Vorbereitet zur ärztlichen Freigabe für das Erstgespräch
            </span>
            <button
              onClick={() => alert('Freigabe erteilt. An Primärpraxis übermittelt.')}
              className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-medium rounded-lg text-xs transition-colors"
            >
              Bericht fachärztlich freigeben
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
