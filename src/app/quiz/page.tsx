'use client';

import dynamic from 'next/dynamic';
import React from 'react';

// Dynamically import the quiz content and disable SSR to completely eliminate "500 Internal Server Error" 
// issues caused by window/document references in third-party math renderers or complex states.
const DynamicQuiz = dynamic(() => import('./QuizPageContent'), { 
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-[#f3f4f6] flex flex-col items-center justify-center p-20">
      <div className="w-12 h-12 border-4 border-gray-200 border-t-[#4338ca] rounded-full animate-spin mb-4"></div>
      <p className="text-gray-500 font-medium animate-pulse">Building your CBT interface...</p>
    </div>
  )
});

export default function QuizPageWrapper() {
  return (
    <div className="relative min-h-[85vh] bg-[#f8fafc] overflow-hidden">
      {/* The actual page underneath, rendered but mostly greyed out/disabled */}
      <DynamicQuiz />

      {/* The Translucent Minimal "Coming Soon" Watermark / Overlay */}
      <div className="absolute inset-0 z-[100] flex items-center justify-center bg-white/60 backdrop-blur-[4px] pointer-events-auto cursor-not-allowed">
        <div className="bg-white/90 backdrop-blur-md px-10 py-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-white/50 flex flex-col items-center transform -translate-y-12">
          <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-inner mb-4">
            <svg className="w-6 h-6 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="text-xs font-black text-indigo-600 mb-1.5 tracking-[0.2em] uppercase">CETify Arsenal</span>
          <h2 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight drop-shadow-sm">Coming Soon</h2>
          <div className="mt-6 w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-indigo-600 h-full w-2/3 rounded-full animate-[pulse_2s_ease-in-out_infinite]"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
