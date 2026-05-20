'use client';

import { useRef, useState } from 'react';
import { CalculationResult, ExamMeta } from '@/types';

interface ShareableResultProps {
  result: CalculationResult;
  meta: ExamMeta;
}

export default function ShareableResult({ result, meta }: ShareableResultProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);

  const downloadAsPDF = async () => {
    if (!cardRef.current) return;
    setLoading(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      const element = cardRef.current;
      
      // Use html2canvas to capture the element with high scale for crispness
      const canvas = await html2canvas(element, {
        scale: 3, // High resolution
        backgroundColor: '#ffffff',
        useCORS: true,
        allowTaint: true,
        logging: false,
        onclone: (clonedDoc) => {
          // You can modify style of cloned element here if needed
        }
      });

      const imgData = canvas.toDataURL('image/png');
      
      // Calculate width and height in mm (1 px = 0.264583 mm)
      const pdfWidth = canvas.width * 0.264583;
      const pdfHeight = canvas.height * 0.264583;

      // Adjust dimensions so that we create a PDF page of the exact dimension of our card
      // We divide by the scale factor (3) to get the original layout dimensions in mm
      const originalPdfWidth = pdfWidth / 3;
      const originalPdfHeight = pdfHeight / 3;

      const pdf = new jsPDF({
        orientation: originalPdfWidth > originalPdfHeight ? 'landscape' : 'portrait',
        unit: 'mm',
        format: [originalPdfWidth, originalPdfHeight]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, originalPdfWidth, originalPdfHeight, undefined, 'FAST');
      pdf.save(`CETify-Score-${meta.candidateName ? meta.candidateName.replace(/\s+/g, '-') : 'Result'}.pdf`);
    } catch (err) {
      console.error('Failed to create PDF:', err);
      alert('Failed to generate PDF scorecard. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 max-w-xl mx-auto shadow-sm">
      <h3 className="text-base font-bold text-[#0f172a] mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-[#4338ca]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 8.25H7.5a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25H15M9 12l3 3m0 0l3-3m-3 3V2.25" />
        </svg>
        Your Official Scorecard
      </h3>
      
      {/* Capturable Card - beautiful, clean design */}
      <div 
        ref={cardRef} 
        className="bg-white border border-gray-200 rounded-xl p-6 md:p-8 select-none"
        style={{ contentVisibility: 'auto' }}
      >
        <div className="flex items-center justify-between border-b border-gray-100 pb-5 mb-6">
          <div>
            <h4 className="text-xl font-black tracking-tight text-[#0f172a] flex items-center gap-1.5">
              <span className="text-[#4338ca]">CET</span><span>ify</span>
            </h4>
            <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mt-0.5">
              Official MHT CET Score Report
            </p>
          </div>
          <div className="text-right">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
              Verified
            </span>
          </div>
        </div>

        {/* Candidate Info */}
        <div className="grid grid-cols-2 gap-y-4 gap-x-6 mb-6 pb-6 border-b border-gray-100">
          <div>
            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Candidate Name</p>
            <p className="text-sm font-semibold text-[#0f172a] mt-0.5 truncate">{meta.candidateName || 'N/A'}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Application No.</p>
            <p className="text-sm font-mono font-semibold text-[#0f172a] mt-0.5">{meta.applicationNumber || 'N/A'}</p>
          </div>
        </div>

        {/* Score Grid */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          <div className="col-span-4 sm:col-span-1 bg-[#4338ca]/5 border border-[#4338ca]/10 rounded-xl p-4 text-center">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Total Score</p>
            <p className="text-3xl font-black text-[#4338ca] mt-1">{result.totalMarks}</p>
            <p className="text-xs font-semibold text-gray-400 mt-1">/ {result.maxMarks}</p>
          </div>
          
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-center">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Physics</p>
            <p className="text-xl font-bold text-[#0f172a] mt-1">{result.physics.marks}</p>
            <p className="text-xs text-gray-400">/ {result.physics.maxMarks}</p>
          </div>
          
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-center">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Chemistry</p>
            <p className="text-xl font-bold text-[#0f172a] mt-1">{result.chemistry.marks}</p>
            <p className="text-xs text-gray-400">/ {result.chemistry.maxMarks}</p>
          </div>
          
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-center">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Maths</p>
            <p className="text-xl font-bold text-[#0f172a] mt-1">{result.maths.marks}</p>
            <p className="text-xs text-gray-400">/ {result.maths.maxMarks}</p>
          </div>
        </div>

        {/* Accuracy Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 pt-1">
          <p className="font-medium text-gray-500">
            ✓ {result.totalCorrect} Correct  ·  ✗ {result.totalIncorrect} Incorrect  ·  ○ {result.totalUnattempted} Left
          </p>
          <p className="text-[10px] font-semibold text-gray-400 mt-1 sm:mt-0 tracking-wider">
            cetify.app
          </p>
        </div>
      </div>

      {/* Action Button */}
      <div className="flex justify-center mt-6">
        <button
          onClick={downloadAsPDF}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#4338ca] text-white text-sm font-semibold rounded-xl hover:bg-[#3730a3] transition-all hover:shadow-lg active:scale-95 disabled:opacity-50 w-full sm:w-auto"
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Generating PDF...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              Download PDF Scorecard
            </>
          )}
        </button>
      </div>
    </div>
  );
}
