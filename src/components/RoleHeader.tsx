'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, LogOut } from 'lucide-react';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useLanguage } from '@/lib/LanguageContext';

interface HeaderProps {
  title: string;
  roleName: string;
  userName: string;
}

export default function RoleHeader({ title, roleName, userName }: HeaderProps) {
  const { t } = useLanguage();

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-emerald-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link href="/" className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
            <Heart className="w-5 h-5 fill-current" />
          </Link>
          <div>
            <span className="font-bold text-lg tracking-tight text-emerald-950 block">{`Brücke • ${title}`}</span>
            <span className="text-[11px] text-emerald-700 font-medium block -mt-1">
              {t.brandSub}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Language Switcher */}
          <LanguageSwitcher variant="pill" />

          <div className="hidden sm:flex flex-col text-right pl-1">
            <span className="text-xs font-bold text-emerald-950">{userName}</span>
            <span className="text-[10px] text-emerald-700">{roleName}</span>
          </div>

          <Link
            href="/"
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-semibold border border-emerald-200 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t.logout}</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
