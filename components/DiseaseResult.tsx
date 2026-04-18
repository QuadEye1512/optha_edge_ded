'use client';

import type { DiseaseResult as DiseaseResultType } from '@/types/prediction';
import ProbabilityBar from './ProbabilityBar';

interface DiseaseResultProps {
  result: DiseaseResultType;
}

const DISEASE_COLORS: Record<string, string> = {
  Normal: '#22c55e',
  Diabetes: '#ef4444',
  Glaucoma: '#a855f7',
  Cataract: '#3b82f6',
  AMD: '#f97316',
  Hypertension: '#f43f5e',
  Myopia: '#6366f1',
  Other: '#64748b',
};

export default function DiseaseResult({ result }: DiseaseResultProps) {
  return (
    <div className="rounded-2xl bg-slate-800/60 border border-slate-700/80 p-5 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-slate-200 flex items-center gap-2">
          <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
          </svg>
          Disease Classification
        </h3>
        <span
          id="disease-top-badge"
          className="px-3 py-1 rounded-full text-sm font-semibold bg-cyan-500/15 text-cyan-400 border border-cyan-500/25"
        >
          {result.topPrediction}
        </span>
      </div>

      {/* Disease probability bars sorted desc */}
      <div className="space-y-3">
        {result.classes.map((cls, index) => (
          <div
            key={cls.name}
            className="transition-all duration-300"
            style={{ animationDelay: `${index * 80}ms` }}
          >
            <ProbabilityBar
              label={cls.name}
              percentage={cls.percentage}
              color={DISEASE_COLORS[cls.name] || '#64748b'}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
