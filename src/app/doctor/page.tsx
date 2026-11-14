'use client';

import React from 'react';
import RoleHeader from '@/components/RoleHeader';
import DoctorPortal from '@/components/DoctorPortal';
import { DEMO_ACCOUNTS } from '@/lib/mockData';
import { useLanguage } from '@/lib/LanguageContext';

export default function DoctorPage() {
  const { t } = useLanguage();
  const doctorUser = DEMO_ACCOUNTS.find(a => a.role === 'doctor')!;

  return (
    <div className="min-h-screen bg-[#F8FAF8] text-[#1C2E24] flex flex-col">
      <RoleHeader 
        title={t.roles.doctorPortal} 
        roleName={t.roles.doctorStatus} 
        userName={doctorUser.name} 
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <DoctorPortal user={doctorUser} />
      </main>
    </div>
  );
}
