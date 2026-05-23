'use client';

import React from 'react';

interface QuizProgressProps {
  currentIndex: number;
  totalQuestions: number;
  correct: number;
  incorrect: number;
}

export default function QuizProgress({ currentIndex, totalQuestions, correct, incorrect }: QuizProgressProps) {
  const progressPercentage = (currentIndex / totalQuestions) * 100;
  const unattempted = currentIndex - (correct + incorrect);

  return (
    <div className="w-full max-w-3xl mx-auto mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-4">
          <h3 className="font-bold text-gray-900 text-lg">
            Question {currentIndex + 1}
            <span className="text-gray-400 font-medium ml-1">/ {totalQuestions}</span>
          </h3>
        </div>
        
        <div className="flex items-center gap-3 md:gap-5 text-sm font-semibold bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-1.5 text-green-600" title="Correct">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            {correct}
          </div>
          <div className="w-px h-4 bg-gray-200"></div>
          <div className="flex items-center gap-1.5 text-red-500" title="Incorrect">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            {incorrect}
          </div>
          <div className="w-px h-4 bg-gray-200 hidden md:block"></div>
          <div className="items-center gap-1.5 text-gray-400 hidden md:flex" title="Skipped">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 12H6" />
            </svg>
            {unattempted}
          </div>
        </div>
      </div>
      
      {/* Progress Bar Container */}
      <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden flex shadow-inner">
        <div 
          className="h-full bg-gradient-to-r from-[#4338ca] to-[#6366f1] transition-all duration-500 ease-out rounded-full relative"
          style={{ width: `${progressPercentage}%` }}
        >
          {/* Shine effect on progress bar */}
          <div className="absolute top-0 inset-x-0 h-full bg-white/20"></div>
        </div>
      </div>
    </div>
  );
}
