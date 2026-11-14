'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { DEMO_ACCOUNTS } from '@/lib/mockData';
import { Heart, Stethoscope, UserCheck, Shield, ArrowRight } from 'lucide-react';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useLanguage } from '@/lib/LanguageContext';

export default function LoginPage() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const [selectedRole, setSelectedRole] = React.useState<'patient' | 'doctor' | 'practitioner'>('patient');

  const currentDemoUser = DEMO_ACCOUNTS.find(a => a.role === selectedRole)!;

  const handleLogin = (e: React.MouseEvent) => {
    e.preventDefault();
    if (selectedRole === 'patient') {
      router.push('/patient');
    } else if (selectedRole === 'doctor') {
      router.push('/doctor');
    } else {
      router.push('/practitioner');
    }
  };

  const getRoleDisplayName = (role: 'patient' | 'doctor' | 'practitioner') => {
    if (role === 'patient') return t.login.patientRole;
    if (role === 'doctor') return t.login.doctorRole;
    return t.login.reviewerRole;
  };

  const getUserTitleDisplay = () => {
    if (language === 'en') {
      if (selectedRole === 'patient') return 'Waiting list psych. consultation';
      if (selectedRole === 'doctor') return 'Senior Physician / Therapy Lead';
      return 'Clinical Psychologist (M.Sc.)';
    }
    return currentDemoUser.title;
  };

  return (
    <div className="min-h-screen bg-[#F8FAF8] flex flex-col justify-center items-center px-4 py-12 relative">
      {/* Top Language Switcher bar */}
      <div className="absolute top-6 right-6">
        <LanguageSwitcher variant="pill" />
      </div>

      {/* Brand Header */}
      <div className="text-center max-w-md mb-8">
        <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md mb-4">
          <Heart className="w-8 h-8 fill-current" />
        </div>
        <h1 className="text-2xl font-bold text-emerald-950 tracking-tight">{t.brandName}</h1>
        <p className="text-sm text-emerald-700 mt-1">
          {t.brandTagline}
        </p>
      </div>

      {/* Role Selection Box */}
      <div className="w-full max-w-md bg-white rounded-3xl border border-emerald-100 shadow-xl shadow-emerald-900/5 p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">{t.login.roleSelection}</span>
          <span className="text-[11px] bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200">
            {t.protectedAccess}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-6">
          <button
            type="button"
            onClick={() => setSelectedRole('patient')}
            className={`p-3 rounded-2xl border text-center transition-all ${
              selectedRole === 'patient'
                ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-500/20'
                : 'bg-white border-emerald-100 text-emerald-700 hover:bg-emerald-50/50'
            }`}
          >
            <Heart className="w-5 h-5 mx-auto mb-1 text-emerald-600" />
            <span className="text-xs font-semibold block">{t.login.patientRole}</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedRole('doctor')}
            className={`p-3 rounded-2xl border text-center transition-all ${
              selectedRole === 'doctor'
                ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-500/20'
                : 'bg-white border-emerald-100 text-emerald-700 hover:bg-emerald-50/50'
            }`}
          >
            <Stethoscope className="w-5 h-5 mx-auto mb-1 text-emerald-600" />
            <span className="text-xs font-semibold block">{t.login.doctorRole}</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedRole('practitioner')}
            className={`p-3 rounded-2xl border text-center transition-all ${
              selectedRole === 'practitioner'
                ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-500/20'
                : 'bg-white border-emerald-100 text-emerald-700 hover:bg-emerald-50/50'
            }`}
          >
            <UserCheck className="w-5 h-5 mx-auto mb-1 text-emerald-600" />
            <span className="text-xs font-semibold block">{t.login.reviewerRole}</span>
          </button>
        </div>

        {/* Selected Account Card Preview */}
        <div className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-100 mb-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-800">{t.login.loggedInAccount}</span>
            <span className="text-[10px] bg-white px-2 py-0.5 rounded-full border border-emerald-200 text-emerald-800 font-bold uppercase">
              {getRoleDisplayName(currentDemoUser.role)}
            </span>
          </div>
          <div className="font-bold text-emerald-950 text-sm">{currentDemoUser.name}</div>
          <div className="text-xs text-emerald-700">{getUserTitleDisplay()}</div>
          {currentDemoUser.clinic && (
            <div className="text-[11px] text-emerald-800 font-medium">📍 {currentDemoUser.clinic}</div>
          )}
          <div className="text-[11px] text-emerald-600/80 pt-1 font-mono">{currentDemoUser.email}</div>
        </div>

        {/* Login Button */}
        <button
          onClick={handleLogin}
          className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-600/20"
        >
          <span>{`${t.login.continueAs} ${getRoleDisplayName(selectedRole)}`}</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <div className="mt-6 pt-4 border-t border-emerald-100/60 flex items-center justify-center gap-2 text-[11px] text-emerald-600">
          <Shield className="w-3.5 h-3.5" />
          <span>{t.login.securityHint}</span>
        </div>
      </div>
    </div>
  );
}
