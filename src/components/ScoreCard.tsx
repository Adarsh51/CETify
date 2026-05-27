'use client';

import React, { useRef, useState } from 'react';
import CookedCertificate from './CookedCertificate';
import { generateCookedCertificate } from '@/utils/generateMeme';
import Link from 'next/link';

interface ScoreCardProps {
  totalMarks: number;
  maxMarks: number;
  percentage: number;
  applicationNumber: string;
  shift: string;
  onDownloadPdf?: () => void;
}

export default function ScoreCard({ totalMarks, maxMarks, percentage, applicationNumber, shift, onDownloadPdf }: ScoreCardProps) {
  const certificateRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const isCooked = totalMarks < 60; // The official threshold for being "Cooked"

  const handleGenerateMeme = async () => {
    setIsGenerating(true);
    await generateCookedCertificate('cooked-certificate', `Officially-Cooked-${applicationNumber}.png`);
    setIsGenerating(false);
  };
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8 shadow-sm">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#0f172a] mb-1">
              Your Estimated Score
            </h2>
            <p className="text-sm text-gray-400">
              Based on the uploaded response sheet analysis.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            {onDownloadPdf && (
              <button
                onClick={onDownloadPdf}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#4338ca] text-white hover:bg-[#3730a3] text-sm font-semibold rounded-xl transition-all shadow-sm hover:shadow active:scale-95"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                Download PDF Scorecard
              </button>
            )}

            <Link
              href={`/predictor?marks=${totalMarks}&shift=${encodeURIComponent(shift)}`}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 text-sm font-bold rounded-xl transition-all shadow-sm hover:shadow-lg active:scale-95"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              Predict Your Percentile
            </Link>

            {isCooked && (
              <button
                onClick={handleGenerateMeme}
                disabled={isGenerating}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-red-600 text-white hover:bg-red-700 text-sm font-bold rounded-xl transition-all shadow-sm shadow-red-600/30 hover:shadow-red-600/50 active:scale-95 disabled:opacity-50"
              >
                {isGenerating ? (
                  <span className="animate-pulse">Cooking...</span>
                ) : (
                  <>
                    <span className="text-lg">💀</span>
                    Generate "Cooked" Certificate
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Big Score Display */}
        <div className="bg-[#eef2ff] rounded-xl px-8 py-5 text-center min-w-[140px] border border-[#c7d2fe]">
          <p className="text-4xl md:text-5xl font-extrabold text-[#4338ca]">
            {totalMarks}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            / {maxMarks}
          </p>
        </div>
      </div>

      {/* Hidden Certificate for HTML2Canvas */}
      {isCooked && (
        <CookedCertificate 
          ref={certificateRef}
          applicationNumber={applicationNumber}
          totalMarks={totalMarks}
          shift={shift}
        />
      )}
    </div>
  );
}
