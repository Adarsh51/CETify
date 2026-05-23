'use client';

import React, { useState, useEffect } from 'react';
import { getAvailableQuizShifts } from '@/utils/quiz';

interface QuizSetupProps {
  onStart: (shift: string, subject: string | null, count: number) => void;
}

export default function QuizSetup({ onStart }: QuizSetupProps) {
  const [shifts, setShifts] = useState<{examDate: string, shift: string, totalCount: number}[]>([]);
  const [selectedShift, setSelectedShift] = useState<string>('random');
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [selectedCount, setSelectedCount] = useState<number>(25);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadShifts() {
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
  }, []);

  const handleStart = () => {
    onStart(
      selectedShift, 
      selectedSubject === 'All' ? null : selectedSubject, 
      selectedCount
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-[#4338ca] rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 font-medium animate-pulse">Loading question bank...</p>
      </div>
    );
  }

  const hasData = shifts.length > 0;

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-500">
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-[#4338ca] to-[#312e81] p-10 text-center relative overflow-hidden">
        {/* Abstract background shapes */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-[#818cf8] opacity-10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <div className="w-16 h-16 mx-auto bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20 mb-6 shadow-2xl">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold text-white mb-3">CETify Practice Quiz</h2>
          <p className="text-[#a5b4fc] text-lg font-medium max-w-md mx-auto">
            Test yourself with real MHT CET questions, extracted directly from official response sheets.
          </p>
        </div>
      </div>

      <div className="p-8 md:p-10 space-y-10">
        
        {!hasData ? (
          <div className="text-center p-8 bg-yellow-50 rounded-2xl border border-yellow-200">
            <svg className="w-12 h-12 text-yellow-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 className="text-lg font-bold text-yellow-900 mb-2">No Questions Available Yet</h3>
            <p className="text-yellow-700 text-sm">
              The AI extraction pipeline is currently running. Please check back in a few minutes once questions have been populated into the database.
            </p>
          </div>
        ) : (
          <>
            {/* Shift Selection */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-4 h-4 text-[#4338ca]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Select Paper
              </label>
              <div className="relative">
                <select 
                  value={selectedShift}
                  onChange={(e) => setSelectedShift(e.target.value)}
                  className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-900 font-medium py-3.5 px-4 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4338ca]/30 focus:border-[#4338ca] transition-all"
                >
                  <option value="random">🎲 Random Mix (All Shifts)</option>
                  {shifts.map((s, idx) => {
                    const val = `${s.examDate}|${s.shift}`;
                    return <option key={idx} value={val}>{s.examDate} - {s.shift} ({s.totalCount} Qs)</option>
                  })}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Subject Selection */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-4 h-4 text-[#4338ca]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Select Subject
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {['All', 'Physics', 'Chemistry', 'Mathematics'].map((subject) => (
                  <button
                    key={subject}
                    onClick={() => setSelectedSubject(subject)}
                    className={`py-3 px-2 rounded-xl text-sm font-bold transition-all ${
                      selectedSubject === subject 
                        ? 'bg-[#eef2ff] text-[#4338ca] border-2 border-[#4338ca] shadow-sm' 
                        : 'bg-white text-gray-500 border-2 border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {subject}
                  </button>
                ))}
              </div>
            </div>

            {/* Question Count Selection */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-4 h-4 text-[#4338ca]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                Number of Questions
              </label>
              <div className="flex gap-3">
                {[10, 25, 50].map((count) => (
                  <button
                    key={count}
                    onClick={() => setSelectedCount(count)}
                    className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
                      selectedCount === count 
                        ? 'bg-gray-900 text-white shadow-md transform scale-[1.02]' 
                        : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {count}
                  </button>
                ))}
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* Start Button */}
            <button
              onClick={handleStart}
              className="w-full py-4 bg-gradient-to-r from-[#4338ca] to-[#4f46e5] text-white text-lg font-bold rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all flex justify-center items-center gap-2"
            >
              Start Practice Session
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
