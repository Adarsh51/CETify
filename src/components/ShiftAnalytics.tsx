'use client';

import { ShiftStats } from '@/utils/db';

interface ShiftAnalyticsProps {
  stats: ShiftStats;
  attempt: string;
  examDate: string;
  shift: string;
  groupType: 'PCM' | 'PCB';
}

export default function ShiftAnalytics({
  stats,
  attempt,
  examDate,
  shift,
  groupType,
}: ShiftAnalyticsProps) {
  const { totalStudents, aheadCount, behindCount, highestScore, lowestScore, averageScore } = stats;
  const isTopper = aheadCount === 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8 space-y-6">
      
      {/* Section Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
        <div>
          <h3 className="text-lg font-bold text-[#0f172a] flex items-center gap-2">
            Shift Analytics & Leaderboard
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            Based on <span className="font-semibold text-[#4338ca]">{totalStudents}</span> student calculations in your shift.
          </p>
        </div>
        <span className="self-start sm:self-center px-3 py-1 bg-[#eef2ff] text-[#4338ca] text-xs font-semibold rounded-full tracking-wide border border-[#c7d2fe]">
          {groupType} · {attempt} · {examDate} · {shift}
        </span>
      </div>

      {totalStudents === 1 && (
        <div className="bg-[#eef2ff] border border-[#c7d2fe] rounded-xl p-4 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0 border border-gray-200">
            <svg className="w-4 h-4 text-[#4338ca]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
            </svg>
          </div>
          <div className="text-left">
            <h4 className="font-bold text-[#0f172a] text-sm">First in Shift!</h4>
            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
              You are the first student to calculate results for this shift on CETify. Rankings will appear as more students join.
            </p>
          </div>
        </div>
      )}

      {totalStudents === 2 && (
        <div className="bg-[#eef2ff] border border-[#c7d2fe] rounded-xl p-4 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0 border border-gray-200">
            <svg className="w-4 h-4 text-[#4338ca]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
            </svg>
          </div>
          <div className="text-left">
            <h4 className="font-bold text-[#0f172a] text-sm">Growing Cohort</h4>
            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
              Only a couple of candidates have calculated scores for this shift so far. Check back as more students join!
            </p>
          </div>
        </div>
      )}

      {/* Personalized Rank Indicator */}
      {isTopper ? (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.003 6.003 0 01-3.77 1.522m0 0a6.003 6.003 0 01-3.77-1.522" />
            </svg>
          </div>
          <div>
            <h4 className="font-bold text-amber-800 text-sm">Shift Topper!</h4>
            <p className="text-xs text-amber-700/80 mt-0.5">
              Congratulations! You currently hold the highest score for this shift on CETify.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-100 rounded-xl p-5 space-y-4">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Your Ranking Performance
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white border border-gray-200 rounded-xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center font-bold text-sm">
                {aheadCount}
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium">Students Ahead</p>
                <p className="text-sm font-bold text-[#0f172a]">higher score than you</p>
              </div>
            </div>
            
            <div className="p-4 bg-white border border-gray-200 rounded-xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center font-bold text-sm">
                {behindCount}
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium">Students Behind</p>
                <p className="text-sm font-bold text-[#0f172a]">lower score than you</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Statistical Cards grid */}
      <div className="grid grid-cols-3 gap-4">
        
        {/* Highest Score */}
        <div className="bg-[#eef2ff] border border-[#c7d2fe] rounded-xl p-4 text-center">
          <span className="text-xs font-semibold text-[#4338ca] uppercase tracking-wider block mb-1">Highest</span>
          <span className="text-xl sm:text-2xl font-extrabold text-[#0f172a] block mt-1">
            {highestScore}
          </span>
          <span className="text-[10px] text-gray-400">marks / 200</span>
        </div>

        {/* Average Score */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Average</span>
          <span className="text-xl sm:text-2xl font-extrabold text-[#0f172a] block mt-1">
            {averageScore}
          </span>
          <span className="text-[10px] text-gray-400">marks / 200</span>
        </div>

        {/* Lowest Score */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Lowest</span>
          <span className="text-xl sm:text-2xl font-extrabold text-[#0f172a] block mt-1">
            {lowestScore}
          </span>
          <span className="text-[10px] text-gray-400">marks / 200</span>
        </div>

      </div>

    </div>
  );
}
