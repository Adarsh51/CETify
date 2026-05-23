'use client';

import React, { useState } from 'react';
import { CalculationResult, ParseResult } from '@/types';
import { ShiftStats, GlobalShiftStats } from '@/utils/db';

interface DeepAnalysisProps {
  result: CalculationResult;
  meta: ParseResult['meta'];
  questions: ParseResult['questions'];
  shiftStats: ShiftStats | null;
  globalStats: GlobalShiftStats[] | null;
  attempt: string;
  examDate: string;
  shift: string;
  groupType: 'PCM' | 'PCB';
}

export default function DeepAnalysis({
  result,
  meta,
  questions,
  shiftStats,
  globalStats,
  attempt,
  examDate,
  shift,
  groupType
}: DeepAnalysisProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'question-wise' | 'shift-analysis' | 'ai-analysis'>('overview');

  const percentile = shiftStats 
    ? ((shiftStats.behindCount / shiftStats.totalStudents) * 100).toFixed(1)
    : '0.0';

  const renderTabButton = (id: typeof activeTab, label: string) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`px-6 py-2.5 text-sm font-semibold rounded-full transition-all ${
        activeTab === id 
          ? 'bg-[#10b981] text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]' 
          : 'bg-[#1e293b] text-gray-400 hover:text-gray-200 hover:bg-[#334155]'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="w-full bg-[#0f172a] text-white rounded-3xl overflow-hidden shadow-2xl font-sans">
      {/* Top Header Section */}
      <div className="p-8 border-b border-gray-800">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
          <svg className="w-7 h-7 text-[#10b981]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
          </svg>
          Deep Analysis Dashboard
        </h2>
        
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-3">
          {renderTabButton('overview', 'Score Overview')}
          {renderTabButton('question-wise', 'Question-wise Analysis')}
          {renderTabButton('shift-analysis', 'Shift Analysis')}
          {renderTabButton('ai-analysis', 'AI Insights')}
        </div>
      </div>

      <div className="p-8">
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 bg-[#1e293b] rounded-2xl p-6 border border-gray-800">
              <div className="text-center sm:text-left">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Score</p>
                <p className="text-3xl font-extrabold text-white">{result.totalMarks}</p>
                <p className="text-xs text-gray-500 mt-1">out of {result.maxMarks}</p>
              </div>
              <div className="text-center sm:text-left">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Percentile</p>
                <p className="text-3xl font-extrabold text-[#10b981]">{percentile}</p>
                <p className="text-xs text-gray-500 mt-1">in your shift</p>
              </div>
              <div className="text-center sm:text-left">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Correct</p>
                <p className="text-2xl font-bold text-[#10b981]">{result.totalCorrect}</p>
              </div>
              <div className="text-center sm:text-left">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Incorrect</p>
                <p className="text-2xl font-bold text-[#ef4444]">{result.totalIncorrect}</p>
              </div>
              <div className="text-center sm:text-left">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Unattempted</p>
                <p className="text-2xl font-bold text-gray-400">{result.totalUnattempted}</p>
              </div>
            </div>

            {/* Subject Donuts */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[result.physics, result.chemistry, result.maths].map((sub) => {
                const colors = {
                  Physics: '#0ea5e9', // Sky blue
                  Chemistry: '#d946ef', // Fuchsia
                  Mathematics: '#10b981', // Emerald
                };
                const color = colors[sub.subject as keyof typeof colors];
                const dashArray = 251.2; // 2 * pi * 40
                const dashOffset = dashArray - (dashArray * sub.accuracy) / 100;

                return (
                  <div key={sub.subject} className="bg-[#1e293b] rounded-2xl p-6 border border-gray-800 flex flex-col items-center">
                    <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-6">{sub.subject} Accuracy</h3>
                    
                    <div className="relative w-32 h-32 mb-6">
                      {/* Background Ring */}
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="64" cy="64" r="40" fill="transparent" stroke="#334155" strokeWidth="12" />
                        <circle 
                          cx="64" cy="64" r="40" fill="transparent" 
                          stroke={color} strokeWidth="12" 
                          strokeDasharray={dashArray} strokeDashoffset={dashOffset}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold" style={{ color }}>{Math.round(sub.accuracy)}%</span>
                        <span className="text-[10px] text-gray-400">Accuracy</span>
                      </div>
                    </div>

                    <div className="flex gap-4 text-xs font-semibold">
                      <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#10b981]"></span> {sub.correct}</div>
                      <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#ef4444]"></span> {sub.incorrect}</div>
                      <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-gray-500"></span> {sub.unattempted}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: QUESTION-WISE */}
        {activeTab === 'question-wise' && (
          <div className="bg-[#1e293b] rounded-2xl border border-gray-800 overflow-hidden">
            <div className="p-4 border-b border-gray-800 bg-[#0f172a]/50">
              <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider">Question Breakdown</h3>
            </div>
            <div className="overflow-x-auto max-h-[500px]">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#334155] text-xs uppercase text-gray-400 font-bold sticky top-0">
                  <tr>
                    <th className="px-6 py-4">Q. No</th>
                    <th className="px-6 py-4">Subject</th>
                    <th className="px-6 py-4">Your Answer</th>
                    <th className="px-6 py-4">Correct Answer</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {questions.map((q, idx) => {
                    const isCorrect = q.candidateResponse === q.correctOption;
                    const isUnattempted = !q.candidateResponse;
                    return (
                      <tr key={idx} className="hover:bg-[#334155]/50 transition-colors">
                        <td className="px-6 py-3 font-mono text-gray-300">{q.questionId}</td>
                        <td className="px-6 py-3 text-gray-400">{q.subject}</td>
                        <td className="px-6 py-3 font-bold text-white">{q.candidateResponse || '--'}</td>
                        <td className="px-6 py-3 font-bold text-[#10b981]">{q.correctOption}</td>
                        <td className="px-6 py-3">
                          {isCorrect ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#10b981]/20 text-[#10b981] text-xs font-bold">
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg> Correct
                            </span>
                          ) : isUnattempted ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-500/20 text-gray-400 text-xs font-bold">
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" /></svg> Unattempted
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#ef4444]/20 text-[#ef4444] text-xs font-bold">
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg> Incorrect
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: SHIFT ANALYSIS */}
        {activeTab === 'shift-analysis' && shiftStats && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-[#1e293b] rounded-2xl p-6 border border-gray-800 col-span-1">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Your Position in Shift</h3>
                <p className="text-5xl font-black text-[#f43f5e]">#{shiftStats.aheadCount + 1}</p>
                <p className="text-sm text-gray-500 mt-2 font-medium">Out of {shiftStats.totalStudents} students</p>
                <p className="text-xs text-gray-400 mt-4 leading-relaxed">
                  You scored higher than {shiftStats.behindCount} students in {examDate} {shift}.
                </p>
              </div>

              <div className="bg-[#1e293b] rounded-2xl p-6 border border-gray-800 col-span-2">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-6">Subject-wise Shift Benchmark</h3>
                <div className="space-y-5">
                  {[result.physics, result.chemistry, result.maths].map((sub) => {
                    const widthPct = (sub.marks / sub.maxMarks) * 100;
                    const colors = { Physics: '#0ea5e9', Chemistry: '#d946ef', Mathematics: '#10b981' };
                    return (
                      <div key={sub.subject}>
                        <div className="flex justify-between text-xs font-bold mb-2">
                          <span className="text-gray-300">{sub.subject}</span>
                          <span className="text-white">{sub.marks} / {sub.maxMarks}</span>
                        </div>
                        <div className="w-full bg-[#334155] rounded-full h-2.5 overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${widthPct}%`, backgroundColor: colors[sub.subject as keyof typeof colors] }}></div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: AI INSIGHTS */}
        {activeTab === 'ai-analysis' && (
          <div className="bg-[#1e293b] rounded-2xl border border-gray-800 p-8 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#4338ca] opacity-10 rounded-full blur-3xl"></div>
            
            <div className="flex items-start gap-4 relative z-10">
              <div className="w-12 h-12 bg-gradient-to-br from-[#4338ca] to-[#a855f7] rounded-xl flex items-center justify-center shrink-0 shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.792 0-5.484-.379-8.067-1.087-1.717-.293-2.3-2.379-1.067-3.61L5 14.5" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-1">CETify AI Analysis</h3>
                <p className="text-xs text-gray-400 mb-6 font-medium">Auto-generated performance breakdown</p>
                
                <div className="space-y-4 text-sm text-gray-300 leading-relaxed bg-[#0f172a]/50 p-6 rounded-xl border border-gray-800">
                  <p>
                    <strong className="text-white">Overall Performance:</strong> You have scored <strong className="text-[#10b981]">{result.totalMarks} marks</strong>, placing you in the top {100 - parseFloat(percentile)}% of students in your shift so far. Your overall accuracy stands at <strong className="text-white">{Math.round((result.totalCorrect / result.totalQuestions) * 100)}%</strong>.
                  </p>
                  
                  <div className="my-4 border-l-4 border-amber-500 bg-amber-500/10 p-4 rounded-r-lg text-amber-200">
                    <p className="font-bold text-amber-500 mb-1 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                      Important Changes
                    </p>
                    You have <strong className="text-amber-400">{result.totalIncorrect} incorrect answers</strong>, which means you missed out on potential marks. Since MHT CET has no negative marking, ensure you attempt all questions in the future.
                  </div>

                  <p>
                    <strong className="text-white">Subject Insights:</strong>
                  </p>
                  <ul className="space-y-3 mt-3">
                    {[
                      { s: result.physics, name: 'Physics' },
                      { s: result.chemistry, name: 'Chemistry' },
                      { s: result.maths, name: 'Mathematics' }
                    ].map(item => (
                      <li key={item.name} className="flex items-start gap-2">
                        {item.s.accuracy > 70 ? (
                          <svg className="w-5 h-5 text-[#10b981] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                        ) : item.s.accuracy > 40 ? (
                          <svg className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" /></svg>
                        ) : (
                          <svg className="w-5 h-5 text-[#ef4444] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>
                        )}
                        <div>
                          <strong className="text-white">{item.name}:</strong> Accuracy is {Math.round(item.s.accuracy)}%. {
                            item.s.accuracy > 70 ? "Excellent performance! Keep it up." :
                            item.s.accuracy > 40 ? "Average performance. Focus on reducing silly mistakes." :
                            "Weak area. Requires significant conceptual revision."
                          }
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
