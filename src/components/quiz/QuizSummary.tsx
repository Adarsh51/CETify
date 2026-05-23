'use client';

import React from 'react';
import type { QuizQuestion } from '@/utils/quiz';
import type { QuestionStatus } from '@/components/quiz/QuestionPalette';

interface QuizSummaryProps {
  questions: QuizQuestion[];
  answers: Record<string, string>;
  statuses: Record<string, QuestionStatus>;
  onRetry: () => void;
  onReviewSolutions: () => void;
}

export default function QuizSummary({ questions, answers, statuses, onRetry, onReviewSolutions }: QuizSummaryProps) {
  
  // Calculate Marks and Stats
  let totalObtained = 0;
  let totalMax = 0;
  
  let correctCount = 0;
  let incorrectCount = 0;
  let unattemptedCount = 0;
  let markedCount = 0;

  questions.forEach(q => {
    const isMath = q.subject.toLowerCase() === 'mathematics';
    const points = isMath ? 2 : 1;
    totalMax += points;

    const status = statuses[q.id] || 'not_visited';
    if (status === 'marked_for_review' || status === 'answered_marked') {
      markedCount++;
    }

    const userAnswer = answers[q.id];
    if (userAnswer) {
      if (userAnswer === q.correct_option_id) {
        correctCount++;
        totalObtained += points;
      } else {
        incorrectCount++;
      }
    } else {
      unattemptedCount++;
    }
  });

  const percentage = totalMax > 0 ? Math.round((totalObtained / totalMax) * 100) : 0;
  
  let feedback = '';
  if (percentage >= 90) feedback = "Outstanding performance!";
  else if (percentage >= 75) feedback = "Great job! A solid score.";
  else if (percentage >= 50) feedback = "Good effort, but there's room to improve.";
  else feedback = "Keep practicing! Review the solutions to understand where you went wrong.";

  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="w-full max-w-3xl mx-auto bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-500">
      
      {/* Header / Score Circle */}
      <div className="bg-gradient-to-br from-[#4338ca] to-[#312e81] p-10 flex flex-col items-center justify-center text-center relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl"></div>
        
        <h2 className="text-2xl font-bold text-white mb-8 relative z-10">Exam Submitted!</h2>
        
        <div className="relative w-40 h-40 flex items-center justify-center mb-6 z-10">
          <svg className="absolute inset-0 w-full h-full transform -rotate-90">
            <circle cx="80" cy="80" r={radius} stroke="rgba(255,255,255,0.1)" strokeWidth="12" fill="none" />
            <circle
              cx="80" cy="80" r={radius} stroke="white" strokeWidth="12" fill="none"
              strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1500 ease-out"
            />
          </svg>
          
          <div className="text-center flex flex-col items-center justify-center">
            <span className="text-4xl font-extrabold text-white">{totalObtained}</span>
            <span className="text-sm font-semibold text-white/70">/ {totalMax} Marks</span>
          </div>
        </div>
        
        <p className="text-[#a5b4fc] text-lg font-medium relative z-10">{feedback}</p>
      </div>

      <div className="p-6 md:p-10">
        
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="bg-green-50 p-4 rounded-2xl text-center border border-green-100">
            <p className="text-xs font-bold uppercase tracking-wider text-green-600 mb-1">Correct</p>
            <p className="text-3xl font-extrabold text-green-700">{correctCount}</p>
          </div>
          
          <div className="bg-red-50 p-4 rounded-2xl text-center border border-red-100">
            <p className="text-xs font-bold uppercase tracking-wider text-red-500 mb-1">Incorrect</p>
            <p className="text-3xl font-extrabold text-red-600">{incorrectCount}</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-2xl text-center border border-gray-200">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Unattempted</p>
            <p className="text-3xl font-extrabold text-gray-700">{unattemptedCount}</p>
          </div>

          <div className="bg-purple-50 p-4 rounded-2xl text-center border border-purple-200">
            <p className="text-xs font-bold uppercase tracking-wider text-purple-600 mb-1">Marked Review</p>
            <p className="text-3xl font-extrabold text-purple-700">{markedCount}</p>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={onReviewSolutions}
            className="flex-1 py-4 bg-[#eef2ff] text-[#4338ca] text-base md:text-lg font-bold rounded-xl border border-[#c7d2fe] hover:bg-[#e0e7ff] transition-colors flex justify-center items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Review Solutions
          </button>
          
          <button
            onClick={onRetry}
            className="flex-1 py-4 bg-gray-900 text-white text-base md:text-lg font-bold rounded-xl shadow-md hover:bg-black transition-colors flex justify-center items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Take Another Quiz
          </button>
        </div>
      </div>
    </div>
  );
}
