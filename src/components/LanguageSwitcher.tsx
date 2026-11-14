'use client';

import React from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { Globe } from 'lucide-react';

interface LanguageSwitcherProps {
  className?: string;
  variant?: 'pill' | 'select' | 'compact';
}

export default function LanguageSwitcher({ className = '', variant = 'pill' }: LanguageSwitcherProps) {
  const { language, setLanguage } = useLanguage();

  if (variant === 'compact') {
    return (
      <div className={`inline-flex items-center gap-1 bg-emerald-50/80 p-0.5 rounded-xl border border-emerald-200 ${className}`}>
        <button
          type="button"
          onClick={() => setLanguage('de')}
          className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
            language === 'de'
              ? 'bg-emerald-600 text-white shadow-2xs'
              : 'text-emerald-700 hover:text-emerald-950 hover:bg-emerald-100/50'
          }`}
          title="Deutsch"
        >
          DE
        </button>
        <button
          type="button"
          onClick={() => setLanguage('en')}
          className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
            language === 'en'
              ? 'bg-emerald-600 text-white shadow-2xs'
              : 'text-emerald-700 hover:text-emerald-950 hover:bg-emerald-100/50'
          }`}
          title="English"
        >
          EN
        </button>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 rounded-2xl p-1 shadow-2xs ${className}`}>
      <Globe className="w-3.5 h-3.5 text-emerald-700 ml-1.5" />
      <button
        type="button"
        onClick={() => setLanguage('de')}
        className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 ${
          language === 'de'
            ? 'bg-white text-emerald-900 shadow-xs border border-emerald-200/80'
            : 'text-emerald-700 hover:text-emerald-950'
        }`}
      >
        <span className="text-xs">🇩🇪</span>
        <span>Deutsch</span>
      </button>
      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 ${
          language === 'en'
            ? 'bg-white text-emerald-900 shadow-xs border border-emerald-200/80'
            : 'text-emerald-700 hover:text-emerald-950'
        }`}
      >
        <span className="text-xs">🇬🇧</span>
        <span>English</span>
      </button>
    </div>
  );
}
