'use client';

import { CalculationResult, ExamMeta } from '@/types';

interface ResultSummaryProps {
  result: CalculationResult;
  meta: ExamMeta;
  layout?: 'sidebar' | 'full';
}

function AccuracyRing({ percentage }: { percentage: number }) {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative w-40 h-40 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="10" />
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke="#4338ca"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-extrabold text-[#4338ca]">{Math.round(percentage)}%</span>
      </div>
    </div>
  );
}

export default function ResultSummary({ result, meta, layout = 'sidebar' }: ResultSummaryProps) {
  const totalAttempted = result.totalCorrect + result.totalIncorrect;
  const overallAccuracy = totalAttempted > 0 ? (result.totalCorrect / totalAttempted) * 100 : 0;

  // Determine best subject
  const subjects = [
    { name: 'Physics', accuracy: result.physics.accuracy },
    { name: 'Chemistry', accuracy: result.chemistry.accuracy },
    { name: 'Mathematics', accuracy: result.maths.accuracy },
  ];
  const best = subjects.reduce((a, b) => (a.accuracy > b.accuracy ? a : b));

  return (
    <div className={layout === 'full' ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : 'flex flex-col gap-4'}>
      {/* Performance Stats */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col justify-between">
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-5">Performance Stats</p>
          <div className="space-y-4">
            {/* Correct */}
            <div className="flex items-center justify-between gap-4 py-2 border-b border-gray-50">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-[#0f172a] truncate">Correct Answers</span>
              </div>
              <span className="text-lg font-bold text-[#0f172a] shrink-0">{result.totalCorrect}</span>
            </div>

            {/* Incorrect */}
            <div className="flex items-center justify-between gap-4 py-2 border-b border-gray-50">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-[#0f172a] truncate">Incorrect Answers</span>
              </div>
              <span className="text-lg font-bold text-[#0f172a] shrink-0">{result.totalIncorrect}</span>
            </div>

            {/* Unattempted */}
            <div className="flex items-center justify-between gap-4 py-2">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-[#0f172a] truncate">Unattempted</span>
              </div>
              <span className="text-lg font-bold text-[#0f172a] shrink-0">{result.totalUnattempted}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Overall Accuracy */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col items-center justify-center">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Overall Accuracy</p>
        <AccuracyRing percentage={overallAccuracy} />
        <p className="text-sm text-gray-400 mt-4 text-center">
          Consistent performance across all sections. High accuracy in {best.name}.
        </p>
      </div>
    </div>
  );
}
