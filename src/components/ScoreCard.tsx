'use client';

interface ScoreCardProps {
  totalMarks: number;
  maxMarks: number;
  percentage: number;
  onDownloadPdf?: () => void;
}

export default function ScoreCard({ totalMarks, maxMarks, percentage, onDownloadPdf }: ScoreCardProps) {
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
          
          {onDownloadPdf && (
            <button
              onClick={onDownloadPdf}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#4338ca] text-white hover:bg-[#3730a3] text-sm font-semibold rounded-xl transition-all shadow-sm hover:shadow active:scale-95"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Download PDF Scorecard
            </button>
          )}
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
    </div>
  );
}
