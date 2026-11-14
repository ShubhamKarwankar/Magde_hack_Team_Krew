'use client';

import React, { useState } from 'react';
import { UserSession, PatientRecord } from '@/types/auth';
import { INITIAL_PATIENTS } from '@/lib/mockData';
import { 
  FileText, 
  FastForward, 
  Download, 
  Calendar, 
  Search,
  Filter,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';

interface DoctorPortalProps {
  user: UserSession;
}

export default function DoctorPortal({ user }: DoctorPortalProps) {
  const { t, language } = useLanguage();
  const [patients, setPatients] = useState<PatientRecord[]>(INITIAL_PATIENTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [selectedPatient, setSelectedPatient] = useState<PatientRecord | null>(null);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [clinicalBrief, setClinicalBrief] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleApproveSoonerAppointment = (patientId: string) => {
    setPatients(prev => prev.map(p => {
      if (p.id === patientId) {
        return {
          ...p,
          appointmentFastTracked: true,
          allocatedDate: language === 'en' ? 'Next week (prioritized)' : 'Nächste Woche (vorgezogen)',
          severityStatus: 'beobachten',
        };
      }
      return p;
    }));
    showToast(language === 'en' 
      ? 'Prioritized appointment approved! Patient fast-tracked to next week.' 
      : 'Priorisierter Termin genehmigt! Patient wurde für nächste Woche vorgezogen.');
  };

  const handleGenerateAndExportSummary = async (patient: PatientRecord) => {
    setSelectedPatient(patient);
    setGeneratingReport(true);
    setClinicalBrief(null);

    try {
      const res = await fetch('/api/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientProfile: {
            primary_concerns: patient.primaryConcerns,
            interaction_style: patient.interactionStyle,
            waitlist_duration_weeks: patient.waitWeeks,
          },
          moodHistory: [{ mood_score: 3 }, { mood_score: 4 }, { mood_score: 3 }, { mood_score: 5 }],
          messageCount: patient.totalChats,
          language: language,
        }),
      });
      const data = await res.json();
      setClinicalBrief(data.summary || (language === 'en' ? 'Summary could not be loaded.' : 'Zusammenfassung konnte nicht geladen werden.'));
    } catch {
      setClinicalBrief(language === 'en' ? 'Error generating clinical brief.' : 'Fehler beim Abruf des Vorab-Berichts.');
    } finally {
      setGeneratingReport(false);
    }
  };

  const filtered = patients.filter(p => {
    const matchSearch = p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        p.pseudonym.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        p.primaryConcerns.some(c => c.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchFilter = filterSeverity === 'all' || p.severityStatus === filterSeverity;
    return matchSearch && matchFilter;
  });

  const getSeverityLabel = (sev: string) => {
    if (language === 'en') {
      if (sev === 'all') return 'All';
      if (sev === 'kritisch') return 'Critical';
      if (sev === 'dringend') return 'Urgent';
      if (sev === 'beobachten') return 'Monitor';
      if (sev === 'stabil') return 'Stable';
    } else {
      if (sev === 'all') return 'Alle';
      if (sev === 'kritisch') return 'Kritisch';
      if (sev === 'dringend') return 'Dringend';
      if (sev === 'beobachten') return 'Beobachten';
      if (sev === 'stabil') return 'Stabil';
    }
    return sev;
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-4 bg-emerald-800 text-white rounded-2xl shadow-xl flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-300" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-emerald-100 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-emerald-950">{t.doctor.title}</h1>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2.5 py-0.5 rounded-full">
              {language === 'en' ? 'Clinic Portal' : 'Klinik-Portal'}
            </span>
          </div>
          <p className="text-xs text-emerald-700 mt-1">
            {language === 'en' ? 'Logged in as ' : 'Angemeldet als '}
            <span className="font-semibold">{user.name}</span> • {user.clinic}
          </p>
        </div>

        {/* Quick Triage Stats */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-emerald-50 rounded-2xl border border-emerald-100 text-center">
            <span className="text-[10px] text-emerald-700 font-bold uppercase block">{language === 'en' ? 'Total' : 'Gesamt'}</span>
            <span className="text-base font-bold text-emerald-950">{patients.length}</span>
          </div>
          <div className="px-4 py-2 bg-rose-50 rounded-2xl border border-rose-100 text-center">
            <span className="text-[10px] text-rose-700 font-bold uppercase block">{language === 'en' ? 'Critical / Urgent' : 'Kritisch / Dringend'}</span>
            <span className="text-base font-bold text-rose-700">
              {patients.filter(p => p.severityStatus === 'kritisch' || p.severityStatus === 'dringend').length}
            </span>
          </div>
        </div>
      </div>

      {/* Controls Bar: Search & Filter */}
      <div className="bg-white rounded-2xl border border-emerald-100 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-emerald-600 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full pl-10 pr-4 py-2 bg-emerald-50/40 border border-emerald-200 rounded-xl text-xs text-emerald-950 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto text-xs">
          <Filter className="w-3.5 h-3.5 text-emerald-600" />
          <span className="font-medium text-emerald-800">{language === 'en' ? 'Severity:' : 'Schweregrad:'}</span>
          {(['all', 'kritisch', 'dringend', 'beobachten', 'stabil'] as const).map((sev) => (
            <button
              key={sev}
              type="button"
              onClick={() => setFilterSeverity(sev)}
              className={`px-3 py-1 rounded-xl text-xs font-medium transition-all ${
                filterSeverity === sev
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
              }`}
            >
              {getSeverityLabel(sev)}
            </button>
          ))}
        </div>
      </div>

      {/* Patients Card Grid */}
      <div className="space-y-3">
        {filtered.map((patient) => (
          <div
            key={patient.id}
            className="bg-white rounded-2xl border border-emerald-100 p-5 shadow-xs hover:border-emerald-200 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            {/* Left: Patient info */}
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-3">
                <span className="font-bold text-sm text-emerald-950">{patient.pseudonym}</span>
                {patient.severityStatus === 'kritisch' && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                    {language === 'en' ? 'Critical (Acute)' : 'Kritisch (Akut)'}
                  </span>
                )}
                {patient.severityStatus === 'dringend' && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                    {language === 'en' ? 'Urgent' : 'Dringend'}
                  </span>
                )}
                {patient.severityStatus === 'beobachten' && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-blue-100 text-blue-800 border border-blue-200">
                    {language === 'en' ? 'Monitor' : 'Beobachten'}
                  </span>
                )}
                {patient.severityStatus === 'stabil' && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                    {language === 'en' ? 'Stable' : 'Stabil'}
                  </span>
                )}
                {patient.appointmentFastTracked && (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    {language === 'en' ? '⚡ Fast-tracked' : '⚡ Vorgezogen'}
                  </span>
                )}
              </div>

              <div className="text-xs text-emerald-700">{patient.fullName}</div>

              <div className="flex flex-wrap gap-1 pt-1.5">
                {patient.primaryConcerns.map((c, i) => (
                  <span key={i} className="px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded-md text-[10px] border border-emerald-100">
                    {c}
                  </span>
                ))}
              </div>
            </div>

            {/* Middle: Stats */}
            <div className="flex items-center gap-6 text-xs text-emerald-900 border-t md:border-t-0 md:border-l border-emerald-50 pt-3 md:pt-0 md:pl-6">
              <div>
                <span className="text-[10px] text-emerald-700 block">{t.doctor.waitCol}</span>
                <span className="font-bold">{patient.waitWeeks} {t.doctor.weeks}</span>
              </div>
              <div>
                <span className="text-[10px] text-emerald-700 block">{language === 'en' ? 'Risk Score' : 'Risiko-Score'}</span>
                <span className="font-bold">{(patient.riskScore * 100).toFixed(0)}%</span>
              </div>
              <div>
                <span className="text-[10px] text-emerald-700 block">{language === 'en' ? 'Appointment' : 'Termin'}</span>
                <span className="font-medium flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-emerald-600" />
                  {patient.allocatedDate}
                </span>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 pt-2 md:pt-0">
              {!patient.appointmentFastTracked && (patient.severityStatus === 'kritisch' || patient.severityStatus === 'dringend') && (
                <button
                  type="button"
                  onClick={() => handleApproveSoonerAppointment(patient.id)}
                  className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
                >
                  <FastForward className="w-3.5 h-3.5" />
                  <span>{t.doctor.fastTrackBtn}</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => handleGenerateAndExportSummary(patient)}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{t.doctor.summaryBtn}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Report Modal or Inline Viewer */}
      {(generatingReport || clinicalBrief) && selectedPatient && (
        <div className="bg-white rounded-3xl border border-emerald-200 p-6 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-emerald-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-emerald-950 flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                <span>{`${t.doctor.reportTitle}: ${selectedPatient.pseudonym}`}</span>
              </h3>
              <p className="text-xs text-emerald-700 mt-0.5">
                {t.doctor.reportDisclaimer}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  alert(language === 'en' 
                    ? `PDF report for ${selectedPatient.pseudonym} has been generated and sent to clinical management.`
                    : `PDF-Bericht für ${selectedPatient.pseudonym} wurde generiert und an Ihr Praxisverwaltungssystem übermittelt.`);
                }}
                disabled={generatingReport}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{language === 'en' ? 'Export PDF / FHIR' : 'Als PDF / FHIR exportieren'}</span>
              </button>
              <button
                type="button"
                onClick={() => setClinicalBrief(null)}
                className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-semibold transition-colors"
              >
                {t.doctor.closeReport}
              </button>
            </div>
          </div>

          {generatingReport ? (
            <div className="py-12 text-center space-y-3">
              <RefreshCw className="w-6 h-6 text-emerald-600 animate-spin mx-auto" />
              <p className="text-xs text-emerald-800 font-medium">
                {language === 'en'
                  ? 'AI is analyzing longitudinal data, mood history, and chat logs for the clinical brief...'
                  : 'KI analysiert Längsschnitt-Daten, Stimmungswerte und Chatverläufe für den klinischen Brief...'}
              </p>
            </div>
          ) : (
            <div className="p-5 bg-emerald-50/30 rounded-2xl border border-emerald-100 text-xs text-emerald-950 leading-relaxed whitespace-pre-line max-h-96 overflow-y-auto">
              {clinicalBrief}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
