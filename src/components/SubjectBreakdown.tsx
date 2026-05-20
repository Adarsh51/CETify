'use client';

import { SubjectResult } from '@/types';

interface SubjectBreakdownProps {
  physics: SubjectResult;
  chemistry: SubjectResult;
  maths: SubjectResult;
}

function SubjectCard({ data, label, color }: { data: SubjectResult; label: string; color: string }) {
  const pct = data.maxMarks > 0 ? (data.marks / data.maxMarks) * 100 : 0;

  const barColor =
    color === 'blue' ? 'bg-blue-500' :
    color === 'green' ? 'bg-green-500' :
    'bg-purple-500';

  const iconBg =
    color === 'blue' ? 'bg-blue-50 text-blue-500' :
    color === 'green' ? 'bg-green-50 text-green-500' :
    'bg-purple-50 text-purple-500';

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</p>
        <div className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center`}>
          {color === 'blue' && (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
            </svg>
          )}
          {color === 'green' && (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
            </svg>
          )}
          {color === 'purple' && (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25v-.008zM8.25 6h7.5v2.25h-7.5V6zM12 2.25c-1.892 0-3.758.11-5.593.322C5.307 2.7 4.5 3.65 4.5 4.757V19.5a2.25 2.25 0 002.25 2.25h10.5a2.25 2.25 0 002.25-2.25V4.757c0-1.108-.806-2.057-1.907-2.185A48.507 48.507 0 0012 2.25z" />
            </svg>
          )}
        </div>
      </div>

      <div className="mb-3">
        <span className="text-3xl font-extrabold text-[#0f172a]">{data.marks}</span>
        <span className="text-sm text-gray-400 ml-1">/ {data.maxMarks}</span>
      </div>

      {/* Accuracy bar */}
      <div className="flex items-center justify-between text-xs mb-1.5">
        <span className="font-semibold text-[#4338ca]">Accuracy</span>
        <span className="text-gray-500">{data.accuracy}%</span>
      </div>
      <div className="w-full h-1.5 bg-gray-100 rounded-full">
        <div className={`h-full rounded-full ${barColor} transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function SubjectBreakdown({ physics, chemistry, maths }: SubjectBreakdownProps) {
  return (
    <>
      <SubjectCard data={physics} label="Physics" color="blue" />
      <SubjectCard data={chemistry} label="Chemistry" color="green" />
      <SubjectCard data={maths} label="Maths" color="purple" />
    </>
  );
}
