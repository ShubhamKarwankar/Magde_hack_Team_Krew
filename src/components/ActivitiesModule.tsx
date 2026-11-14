'use client';

import React, { useState } from 'react';
import { Wind, Anchor, BookOpen, PenTool, CheckCircle, Clock } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';

export default function ActivitiesModule() {
  const { t } = useLanguage();
  const [completed, setCompleted] = useState<Record<string, boolean>>({});

  const activities = [
    {
      id: 'act-1',
      title: t.activities.items.act1Title,
      desc: t.activities.items.act1Desc,
      duration: '4 Min.',
      category: t.activities.items.act1Cat,
      icon: Wind,
    },
    {
      id: 'act-2',
      title: t.activities.items.act2Title,
      desc: t.activities.items.act2Desc,
      duration: '3 Min.',
      category: t.activities.items.act2Cat,
      icon: Anchor,
    },
    {
      id: 'act-3',
      title: t.activities.items.act3Title,
      desc: t.activities.items.act3Desc,
      duration: '6 Min.',
      category: t.activities.items.act3Cat,
      icon: BookOpen,
    },
    {
      id: 'act-4',
      title: t.activities.items.act4Title,
      desc: t.activities.items.act4Desc,
      duration: '5 Min.',
      category: t.activities.items.act4Cat,
      icon: PenTool,
    },
  ];

  const toggleComplete = (id: string) => {
    setCompleted(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="bg-white rounded-2xl border border-emerald-100 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-emerald-950 text-base">{t.activities.title}</h3>
          <p className="text-xs text-emerald-700">{t.activities.subtitle}</p>
        </div>
        <span className="text-xs text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full font-medium border border-emerald-200">
          {t.activities.recommendationTag}
        </span>
      </div>

      <div className="space-y-3">
        {activities.map((a) => {
          const Icon = a.icon;
          const isDone = completed[a.id];

          return (
            <div
              key={a.id}
              className={`p-4 rounded-xl border transition-all ${
                isDone
                  ? 'bg-emerald-50/40 border-emerald-200 opacity-75'
                  : 'bg-white border-emerald-100 hover:border-emerald-300 hover:shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      isDone
                        ? 'bg-emerald-600 text-white'
                        : 'bg-emerald-100/60 text-emerald-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4
                        className={`text-sm font-semibold ${
                          isDone ? 'line-through text-emerald-900/60' : 'text-emerald-950'
                        }`}
                      >
                        {a.title}
                      </h4>
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-medium border border-emerald-200">
                        {a.category}
                      </span>
                    </div>
                    <p className="text-xs text-emerald-700 mt-1 leading-relaxed">
                      {a.desc}
                    </p>
                    <div className="flex items-center gap-1.5 mt-2 text-[11px] text-emerald-800 font-medium">
                      <Clock className="w-3 h-3 text-emerald-600" />
                      <span>{a.duration}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => toggleComplete(a.id)}
                  className={`flex-shrink-0 p-2 rounded-xl border transition-all ${
                    isDone
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white hover:bg-emerald-50 text-emerald-600 border-emerald-200'
                  }`}
                  title={isDone ? t.activities.completed : t.activities.markDone}
                >
                  <CheckCircle className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
