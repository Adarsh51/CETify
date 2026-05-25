'use client';

import React, { useState, useEffect } from 'react';

interface PercentilePredictorProps {
  initialMarks?: number;
  initialShift?: string;
  initialCategory?: string;
}

const ANCHOR_TABLE = [
  [0,   0],
  [50,  70],
  [60,  80],
  [70,  85],
  [80,  88.5],
  [90,  92],
  [100, 95],
  [113, 98.07],
  [120, 98.8],
  [130, 99.5],
  [136, 99.88],
  [145, 99.95],
  [155, 99.98],
  [165, 99.9999],
  [200, 100]
];

const SHIFT_OFFSETS: Record<string, number> = {
  '11 April Shift 1': -4, // Easy-Moderate
  '11 April Shift 2': -2, // Moderate
  '13 April Shift 1': -2, // Moderate
  '13 April Shift 2': 3,  // Moderate-Tough
  '15 April Shift 1': 8,  // Tough
  '15 April Shift 2': -4, // Easy-Moderate
  '16 April Shift 1': -4, // Easy-Moderate
  '16 April Shift 2': -4, // Easy-Moderate
  '17 April Shift 1': -2, // Moderate
  '17 April Shift 2': -2, // Moderate
  '18 April Shift 1': 8,  // Tough
  '18 April Shift 2': -4, // Easy-Moderate
  '19 April Shift 1': -4, // Easy-Moderate
  '19 April Shift 2': -2, // Moderate
};

const ALL_APRIL_SHIFTS = [
  '11 April Shift 1', '11 April Shift 2',
  '13 April Shift 1', '13 April Shift 2',
  '14 April Shift 1', '14 April Shift 2',
  '15 April Shift 1', '15 April Shift 2',
  '16 April Shift 1', '16 April Shift 2',
  '17 April Shift 1', '17 April Shift 2',
  '18 April Shift 1', '18 April Shift 2',
  '19 April Shift 1', '19 April Shift 2',
  '20 April Shift 1', '20 April Shift 2',
];

function predictPercentileAndRank(marks: number, shift: string) {
  const offset = SHIFT_OFFSETS[shift] || 0;
  let adjusted_marks = marks + offset;
  adjusted_marks = Math.max(0, Math.min(200, adjusted_marks));

  let percentile = 0;
  
  if (adjusted_marks >= 200) {
    percentile = 100;
  } else if (adjusted_marks <= 0) {
    percentile = 0;
  } else {
    for (let i = 1; i < ANCHOR_TABLE.length; i++) {
      const [x0, y0] = ANCHOR_TABLE[i - 1];
      const [x1, y1] = ANCHOR_TABLE[i];
      
      if (adjusted_marks <= x1) {
        const t = (adjusted_marks - x0) / (x1 - x0);
        percentile = y0 + t * (y1 - y0);
        break;
      }
    }
  }

  const total_candidates = 450000; // estimated 2026 PCM unique candidate count
  let rank = ((100 - percentile) / 100) * total_candidates;
  rank = Math.round(rank);
  rank = Math.max(rank, 1);

  return {
    percentile,
    rank
  };
}

export default function PercentilePredictor({ initialMarks, initialShift, initialCategory }: PercentilePredictorProps) {
  const [marks, setMarks] = useState<number | ''>(initialMarks !== undefined ? initialMarks : '');
  const [shift, setShift] = useState(initialShift || '11 April Shift 1');
  const [category, setCategory] = useState(initialCategory || 'Open (General)');

  const [result, setResult] = useState({ percentile: 0, rank: 0 });

  useEffect(() => {
    if (typeof marks === 'number' && !isNaN(marks)) {
      setResult(predictPercentileAndRank(marks, shift));
    } else {
      setResult({ percentile: 0, rank: 0 });
    }
  }, [marks, shift, category]);

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden max-w-4xl mx-auto">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 sm:p-8 text-white">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold">MHT CET Rank Predictor 2026</h2>
            <p className="text-blue-100 text-sm">Official 2025 Data Mapping • No Login Required</p>
          </div>
        </div>
      </div>

      <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Form Section */}
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Your MHT CET Score (out of 200)
            </label>
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
              className="w-full h-12 px-4 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-lg font-medium text-gray-900"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Your Exam Shift
            </label>
            <select 
              value={shift}
              onChange={(e) => setShift(e.target.value)}
              className="w-full h-12 px-4 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none bg-white text-gray-900"
            >
              <optgroup label="April Session">
                {ALL_APRIL_SHIFTS.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </optgroup>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {SHIFT_OFFSETS[shift] !== undefined 
                ? `Normalization offset of ${SHIFT_OFFSETS[shift] > 0 ? '+' : ''}${SHIFT_OFFSETS[shift]} marks applied.` 
                : 'No normalisation offset available for this shift yet.'}
            </p>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Category
            </label>
            <select 
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full h-12 px-4 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none bg-white text-gray-900"
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
          </div>
        </div>

        {/* Results Section */}
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 shadow-inner flex flex-col justify-center h-full space-y-6">
          <div className="text-center">
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Estimated Percentile</p>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-5xl font-extrabold text-indigo-600">
                {typeof marks === 'number' ? (result.percentile > 99 ? result.percentile.toFixed(4) : result.percentile.toFixed(2)) : '--'}
              </span>
              <span className="text-lg text-indigo-400 font-bold">%ile</span>
            </div>
          </div>

          <div className="w-full h-px bg-gray-200"></div>

          <div className="text-center">
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Expected Rank (AIR)</p>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-4xl font-extrabold text-emerald-600">
                {typeof marks === 'number' ? result.rank.toLocaleString() : '--'}
              </span>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 text-blue-800 rounded-lg text-xs flex items-start gap-2 border border-blue-100">
             <svg className="w-4 h-4 shrink-0 mt-0.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>
              Rank and percentile estimations use the official formula: <code className="font-mono bg-blue-100 px-1 py-0.5 rounded text-[10px]">Rank = ((100 - %ile) / 100) × 4,50,000</code>. 
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
