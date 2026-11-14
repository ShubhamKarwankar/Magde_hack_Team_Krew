'use client';

import React from 'react';
import RoleHeader from '@/components/RoleHeader';
import ChatView from '@/components/ChatView';
import MoodTracker from '@/components/MoodTracker';
import ActivitiesModule from '@/components/ActivitiesModule';
import { Clock, ShieldCheck } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';

export default function PatientPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-[#F8FAF8] text-[#1C2E24] flex flex-col">
      <RoleHeader 
        title={t.roles.patientPortal} 
        roleName={t.roles.patientStatus} 
        userName="Sarah M." 
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Context Banner */}
        <div className="bg-emerald-50/60 border border-emerald-200 rounded-3xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-emerald-200/60 text-emerald-800 flex items-center justify-center flex-shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-emerald-950">
                {t.patient.waitBannerTitle}
              </h1>
              <p className="text-xs text-emerald-700 mt-0.5">
                {t.patient.waitBannerDesc}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-emerald-800 bg-white px-3.5 py-1.5 rounded-xl border border-emerald-200 shadow-2xs self-start md:self-auto">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>{t.patient.complianceNote}</span>
          </div>
        </div>

        {/* Patient Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[720px]">
          <div className="lg:col-span-7 h-full">
            <ChatView />
          </div>
          <div className="lg:col-span-5 flex flex-col gap-6 overflow-y-auto pr-1">
            <MoodTracker />
            <ActivitiesModule />
          </div>
        </div>
      </main>
    </div>
  );
}
