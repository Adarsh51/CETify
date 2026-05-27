'use client';

import React, { useState, useEffect } from 'react';

interface PercentilePredictorProps {
  initialMarks?: number;
  initialShift?: string;
  initialCategory?: string;
}

const EASY_TABLE = [
  [60, 60.00],
  [70, 69.00],
  [75, 74.00],
  [80, 79.00],
  [85, 83.00],
  [90, 87.00],
  [100, 91.50],
  [110, 94.80],
  [120, 96.50],
  [130, 97.80],
  [140, 98.50],
  [150, 99.10],
  [160, 99.50],
  [170, 99.90],
  [200, 100]
];

const MODERATE_TABLE = [
  [60, 64.00],
  [70, 72.00],
  [75, 77.00],
  [80, 82.00],
  [85, 86.00],
  [90, 89.00],
  [100, 94.10],
  [110, 96.50],
  [120, 97.40],
  [130, 98.50],
  [140, 98.90],
  [150, 99.30],
  [160, 99.60],
  [170, 99.90],
  [200, 100]
];

const HARD_TABLE = [
  [60, 67.00],
  [70, 76.00],
  [75, 80.00],
  [80, 84.00],
  [85, 88.00],
  [90, 92.00],
  [100, 95.50],
  [110, 96.70],
  [120, 98.00],
  [130, 98.80],
  [140, 99.10],
  [150, 99.50],
  [160, 99.80],
  [170, 99.95],
  [200, 100]
];

const SHIFT_DIFFICULTY: Record<string, 'EASY' | 'MODERATE' | 'HARD'> = {
  '11 April Shift 1': 'EASY',
  '11 April Shift 2': 'HARD',
  '13 April Shift 1': 'MODERATE',
  '13 April Shift 2': 'HARD',
  '15 April Shift 1': 'HARD',
  '15 April Shift 2': 'MODERATE',
  '16 April Shift 1': 'MODERATE',
  '16 April Shift 2': 'HARD',
  '17 April Shift 1': 'HARD',
  '17 April Shift 2': 'MODERATE',
  '18 April Shift 1': 'MODERATE',
  '18 April Shift 2': 'MODERATE',
  '19 April Shift 1': 'HARD',
  '19 April Shift 2': 'HARD',
  '20 April Shift 1': 'MODERATE',
  '20 April Shift 2': 'EASY',
};

const ALL_APRIL_SHIFTS = [
  '11 April Shift 1', '11 April Shift 2',
  '13 April Shift 1', '13 April Shift 2',
  '15 April Shift 1', '15 April Shift 2',
  '16 April Shift 1', '16 April Shift 2',
  '17 April Shift 1', '17 April Shift 2',
  '18 April Shift 1', '18 April Shift 2',
  '19 April Shift 1', '19 April Shift 2',
  '20 April Shift 1', '20 April Shift 2',
];

const ALL_MAY_SHIFTS = [
  '12 May Shift 1', '12 May Shift 2',
  '13 May Shift 1', '13 May Shift 2',
  '14 May Shift 1', '14 May Shift 2',
  '15 May Shift 1', '15 May Shift 2',
  '18 May Shift 1', '18 May Shift 2',
  '19 May Shift 1', '19 May Shift 2',
  '20 May Shift 1',
];

function predictPercentileAndRank(marks: number, shift: string) {
  const difficulty = SHIFT_DIFFICULTY[shift] || 'MODERATE';
  
  if (marks < 60) {
    return {
      percentile: 'Unpredictable' as const,
      rank: 0,
      difficulty
    };
  }

  const table = difficulty === 'EASY' ? EASY_TABLE 
              : difficulty === 'HARD' ? HARD_TABLE 
              : MODERATE_TABLE;

  let basePercentile = 0;
  if (marks >= 200) {
    basePercentile = 100;
  } else {
    for (let i = 1; i < table.length; i++) {
      const [x0, y0] = table[i - 1];
      const [x1, y1] = table[i];
      if (marks <= x1) {
        const t = (marks - x0) / (x1 - x0);
        basePercentile = y0 + t * (y1 - y0);
        break;
      }
    }
  }

  const finalPercentile = basePercentile;

  const total_candidates = 450000;
  let rank = ((100 - finalPercentile) / 100) * total_candidates;
  rank = Math.round(rank);
  
  // Apply a smooth 3-4k rank decrease (average of 3,500) scaled down near the top to prevent going below 1
  if (rank > 10000) {
    rank = rank - 3500;
  } else {
    rank = rank - Math.round(3500 * (rank / 10000));
  }
  
  rank = Math.max(rank, 1);

  return {
    percentile: finalPercentile,
    rank,
    difficulty
  };
}

export default function PercentilePredictor({ initialMarks, initialShift, initialCategory }: PercentilePredictorProps) {
  const [marks, setMarks] = useState<number | ''>(initialMarks !== undefined ? initialMarks : '');
  const [shift, setShift] = useState(initialShift || '11 April Shift 1');
  const [category, setCategory] = useState(initialCategory || 'Open (General)');

  const [result, setResult] = useState<{percentile: number | 'Unpredictable', rank: number, difficulty: string}>({ 
    percentile: 0, 
    rank: 0, 
    difficulty: 'MODERATE' 
  });

  useEffect(() => {
    if (typeof marks === 'number' && !isNaN(marks)) {
      setResult(predictPercentileAndRank(marks, shift));
    } else {
      setResult({ percentile: 0, rank: 0, difficulty: SHIFT_DIFFICULTY[shift] || 'MODERATE' });
    }
  }, [marks, shift, category]);

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 overflow-hidden max-w-4xl mx-auto transform transition-all hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)]">
      <div className="bg-gradient-to-br from-[#4338ca] via-indigo-600 to-purple-700 p-8 sm:p-10 text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-2 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shrink-0 shadow-lg">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight drop-shadow-sm">MHT CET Rank Predictor</h2>
            <p className="text-indigo-100 text-sm mt-1 font-medium tracking-wide">Official 2025 Data Mapping • Pure Analytics</p>
          </div>
        </div>
      </div>

      <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Form Section */}
        <div className="space-y-8">
          <div className="space-y-2.5">
            <label className="block text-sm font-bold text-gray-700 tracking-wide">
              YOUR MHT CET SCORE <span className="text-gray-400 font-normal">(out of 200)</span>
            </label>
            <div className="relative group">
              <input 
                type="number" 
                value={marks === '' ? '' : marks}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '') setMarks('');
                  else {
                    const num = Number(val);
                    if (num >= 0 && num <= 200) setMarks(num);
                  }
                }}
                placeholder="e.g. 130"
                className="w-full h-14 px-5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-[#4338ca] focus:ring-4 focus:ring-[#4338ca]/10 outline-none transition-all duration-300 text-xl font-semibold text-gray-900 shadow-sm group-hover:border-gray-300"
              />
            </div>
          </div>

          <div className="space-y-2.5">
            <label className="block text-sm font-bold text-gray-700 tracking-wide">
              YOUR EXAM SHIFT
            </label>
            <div className="relative group">
              <select 
                value={shift}
                onChange={(e) => setShift(e.target.value)}
                className="w-full h-14 px-5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-[#4338ca] focus:ring-4 focus:ring-[#4338ca]/10 outline-none transition-all duration-300 text-lg font-medium text-gray-900 shadow-sm appearance-none group-hover:border-gray-300 cursor-pointer"
              >
                <optgroup label="April Session" className="font-semibold text-gray-500">
                  {ALL_APRIL_SHIFTS.map(s => (
                    <option key={s} value={s} className="text-gray-900 font-medium">{s}</option>
                  ))}
                </optgroup>
                <optgroup label="May Session" className="font-semibold text-gray-500">
                  {ALL_MAY_SHIFTS.map(s => (
                    <option key={s} value={s} className="text-gray-900 font-medium">{s}</option>
                  ))}
                </optgroup>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-400 group-hover:text-indigo-500 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
            <p className="text-xs font-bold text-[#4338ca] mt-2 px-1 tracking-wider uppercase flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4338ca] animate-pulse"></span>
              Difficulty: {result.difficulty} SHIFT
            </p>
          </div>

          <div className="space-y-2.5">
            <label className="block text-sm font-bold text-gray-700 tracking-wide">
              CATEGORY
            </label>
            <div className="relative group">
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-14 px-5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-[#4338ca] focus:ring-4 focus:ring-[#4338ca]/10 outline-none transition-all duration-300 text-lg font-medium text-gray-900 shadow-sm appearance-none group-hover:border-gray-300 cursor-pointer"
              >
                <option value="Open (General)">Open (General)</option>
                <option value="OBC">OBC</option>
                <option value="SC">SC</option>
                <option value="ST">ST</option>
                <option value="EWS">EWS</option>
                <option value="VJ/DT/NT(A)">VJ/DT/NT(A)</option>
                <option value="NT(B)">NT(B)</option>
                <option value="NT(C)">NT(C)</option>
                <option value="NT(D)">NT(D)</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-400 group-hover:text-indigo-500 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="bg-gradient-to-b from-gray-50 to-white rounded-2xl p-8 border border-gray-100 shadow-[inset_0_2px_10px_rgb(0,0,0,0.02)] flex flex-col justify-center h-full space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#4338ca] opacity-5 rounded-bl-full pointer-events-none"></div>
          
          <div className="text-center relative z-10">
            <p className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-3">Estimated Percentile</p>
            <div className="flex items-baseline justify-center gap-1">
              {result.percentile === 'Unpredictable' ? (
                <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500 drop-shadow-sm">
                  Unpredictable
                </span>
              ) : (
                <>
                  <span className="text-[4rem] leading-none font-black text-transparent bg-clip-text bg-gradient-to-br from-[#4338ca] to-purple-600 drop-shadow-sm">
                    {typeof marks === 'number' ? (result.percentile > 99 ? result.percentile.toFixed(4) : result.percentile.toFixed(2)) : '--'}
                  </span>
                  <span className="text-2xl text-indigo-400 font-bold ml-1">%ile</span>
                </>
              )}
            </div>
            {result.percentile === 'Unpredictable' && (
              <p className="text-xs text-orange-500 mt-4 max-w-[250px] mx-auto font-semibold bg-orange-50 p-2 rounded-lg border border-orange-100">
                Scores below 60 are highly variable and cannot be accurately predicted based on historical data.
              </p>
            )}
          </div>
          <div className="w-2/3 mx-auto h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>

          <div className="text-center relative z-10">
            <p className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-3">Expected Rank</p>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-emerald-500 to-teal-600 drop-shadow-sm">
                {result.percentile === 'Unpredictable' ? '--' : (typeof marks === 'number' ? result.rank.toLocaleString() : '--')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimer / Warning */}
      <div className="px-6 pb-6 sm:px-8 sm:pb-8">
        <div className="bg-red-50 border border-red-200/60 rounded-xl p-4 flex items-start gap-3 shadow-sm">
          <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-xs text-red-800 leading-relaxed font-medium">
            <span className="font-bold">Warning:</span> These predictions might be highly inaccurate. Actual MHT CET official results will vary.
          </p>
        </div>
      </div>
    </div>
  );
}
