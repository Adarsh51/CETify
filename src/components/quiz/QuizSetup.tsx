'use client';

import React, { useState, useEffect } from 'react';
import { getAvailableQuizShifts } from '@/utils/quiz';

interface QuizSetupProps {
  onStart: (shift: string, subject: string | null, count: number) => void;
  isLocked?: boolean;
}

export default function QuizSetup({ onStart, isLocked = false }: QuizSetupProps) {
  const [shifts, setShifts] = useState<{examDate: string, shift: string, totalCount: number}[]>([]);
  const [selectedShift, setSelectedShift] = useState<string>('random');
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [selectedCount, setSelectedCount] = useState<number>(25);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadShifts() {
      if (isLocked) {
        // Load realistic static shifts to populate the mock UI without querying the DB
        setShifts([
          { examDate: '12 May 2026', shift: 'Shift 1', totalCount: 124 },
          { examDate: '12 May 2026', shift: 'Shift 2', totalCount: 142 },
          { examDate: '13 May 2026', shift: 'Shift 1', totalCount: 118 },
          { examDate: '13 May 2026', shift: 'Shift 2', totalCount: 135 },
          { examDate: '14 May 2026', shift: 'Shift 1', totalCount: 150 },
        ]);
        setIsLoading(false);
        return;
      }

      try {
        const data = await getAvailableQuizShifts();
        setShifts(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadShifts();
  }, [isLocked]);

  const handleStart = () => {
    onStart(
      selectedShift, 
      selectedSubject === 'All' ? null : selectedSubject, 
      selectedCount
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 bg-white rounded-3xl border border-gray-100 shadow-sm max-w-2xl mx-auto">
        <div className="w-12 h-12 border-4 border-gray-100 border-t-[#4338ca] rounded-full animate-spin mb-5"></div>
        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest animate-pulse">Loading Question Bank</p>
      </div>
    );
  }

  const hasData = shifts.length > 0;

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-500">
      
      {/* ═══ HEADER ═══ */}
      <div className="px-8 pt-10 pb-6 text-center bg-gray-50/50 border-b border-gray-100">
        <div className="w-14 h-14 mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center mb-5">
          <svg className="w-7 h-7 text-[#4338ca]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
          </svg>
        </div>
        <div className="mb-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-800 tracking-widest uppercase border border-amber-200 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            In Progress
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] tracking-tight mb-3">
          CETify The Arsenal
        </h2>
        <p className="text-gray-500 text-sm max-w-md mx-auto leading-relaxed">
          Arm yourself for battle. Test your limits with real MHT CET questions, extracted directly from the verified <strong>2026 April Attempt</strong> response sheets.
        </p>
      </div>

      <div className="p-8 sm:p-10 space-y-10">
        
        {!hasData ? (
          <div className="text-center p-8 bg-amber-50 rounded-2xl border border-amber-100">
            <svg className="w-10 h-10 text-amber-500 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 className="text-sm font-bold text-amber-900 mb-1">No Questions Available Yet</h3>
            <p className="text-amber-700 text-xs">
              The AI extraction pipeline is currently running. Please check back in a few minutes once questions have been populated.
            </p>
          </div>
        ) : (
          <>
            {/* ═══ SHIFT SELECTION ═══ */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4338ca]" />
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                  Target Paper
                </label>
              </div>
              <div className="relative">
                <select 
                  value={selectedShift}
                  onChange={(e) => setSelectedShift(e.target.value)}
                  className="w-full appearance-none bg-white border border-gray-200 text-[#0f172a] font-semibold py-3.5 px-4 pr-10 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#4338ca]/20 focus:border-[#4338ca] hover:border-gray-300 transition-all cursor-pointer"
                >
                  <option value="random">🎲 Random Mix (All Shifts)</option>
                  {shifts.map((s, idx) => {
                    const val = `${s.examDate}|${s.shift}`;
                    return <option key={idx} value={val}>{s.examDate} - {s.shift} ({s.totalCount} Qs)</option>
                  })}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* ═══ SUBJECT SELECTION ═══ */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4338ca]" />
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                  Subject Focus
                </label>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {['All', 'Physics', 'Chemistry', 'Mathematics'].map((subject) => {
                  const isSelected = selectedSubject === subject;
                  return (
                    <button
                      key={subject}
                      onClick={() => setSelectedSubject(subject)}
                      className={`py-3 px-2 rounded-xl text-sm font-bold transition-all border ${
                        isSelected 
                          ? 'bg-[#4338ca] text-white border-[#4338ca] shadow-md shadow-indigo-500/20' 
                          : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {subject}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ═══ QUESTION COUNT ═══ */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4338ca]" />
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                  Number of Questions
                </label>
              </div>
              <div className="flex gap-3">
                {[10, 25, 50].map((count) => {
                  const isSelected = selectedCount === count;
                  return (
                    <button
                      key={count}
                      onClick={() => setSelectedCount(count)}
                      className={`flex-1 py-3.5 rounded-xl text-sm font-bold transition-all border ${
                        isSelected 
                          ? 'bg-[#4338ca] text-white border-[#4338ca] shadow-md shadow-indigo-500/20 transform scale-[1.02]' 
                          : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {count}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={handleStart}
                className="w-full py-4 bg-[#4338ca] text-white text-base font-bold rounded-xl shadow-lg shadow-indigo-500/30 hover:bg-[#3730a3] hover:shadow-indigo-500/40 active:scale-[0.98] transition-all flex justify-center items-center gap-2"
              >
                Start Practice Session
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
