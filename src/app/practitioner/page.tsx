'use client';

import React from 'react';
import RoleHeader from '@/components/RoleHeader';
import PractitionerPortal from '@/components/PractitionerPortal';
import { DEMO_ACCOUNTS } from '@/lib/mockData';
import { useLanguage } from '@/lib/LanguageContext';

export default function PractitionerPage() {
  const { t } = useLanguage();
  const pracUser = DEMO_ACCOUNTS.find(a => a.role === 'practitioner')!;

  return (
    <div className="min-h-screen bg-[#F8FAF8] text-[#1C2E24] flex flex-col">
      <RoleHeader 
        title={t.roles.reviewerPortal} 
        roleName={t.roles.reviewerStatus} 
        userName={pracUser.name} 
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <PractitionerPortal user={pracUser} />
      </main>
    </div>
  );
}
