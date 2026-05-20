'use client';

import { useState, useEffect } from 'react';

export default function LoadingSpinner() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 800),
      setTimeout(() => setPhase(2), 1600),
    ];

    return () => {
      timers.forEach(clearTimeout);
    };
  }, []);

  const loadingTexts = [
    'Reading response sheet HTML...',
    'Matching candidate responses with official answer key...',
    'Tallying shift statistics & rankings...',
  ];

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 max-w-md mx-auto">
      <div className="relative flex items-center justify-center mb-6">
        {/* outer pulsing glow */}
        <div className="absolute w-20 h-20 bg-[#4338ca]/20 rounded-full animate-ping" />
        
        {/* rotating outer ring */}
        <div className="w-16 h-16 border-4 border-gray-100 border-t-[#4338ca] rounded-full animate-spin" />
        
        {/* inner core logo */}
        <div className="absolute w-8 h-8 bg-[#4338ca] rounded-full flex items-center justify-center shadow-lg shadow-[#4338ca]/30">
          <svg className="w-4 h-4 text-white animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
          </svg>
        </div>
      </div>

      <div className="text-center space-y-2">
        <h4 className="text-base font-bold text-[#0f172a]">
          Parsing Response Sheet
        </h4>
        
        {/* Animated dynamic text box */}
        <div className="h-10 flex items-center justify-center">
          <p className="text-sm font-medium text-[#4338ca] animate-pulse transition-all duration-300">
            {loadingTexts[phase]}
          </p>
        </div>

        <p className="text-xs text-gray-400">
          CETify does all calculations securely inside your browser
        </p>
      </div>
    </div>
  );
}
