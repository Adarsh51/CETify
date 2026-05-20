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
import AllShiftsStats from '@/components/AllShiftsStats';
import { saveScore, getShiftStats, ShiftStats } from '@/utils/db';
import { generatePdfReport } from '@/utils/generatePdf';
import Image from 'next/image';

const features = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
    title: 'Instant Score',
    desc: 'Get your precise total score the moment you upload your response sheet. No manual tallying required.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    ),
    title: 'Subject-wise Analysis',
    desc: 'Break down your performance across Physics, Chemistry, and Mathematics to identify your strongest areas.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: 'Real-time Shift Rankings',
    desc: 'Compare your scores against other candidates in the same shift to see where you stand.',
  },
];

function parseSelectedSlot(slotStr: string): { examDate: string; shift: 'Shift 1' | 'Shift 2'; groupType: 'PCM' | 'PCB' } {
  const parts = slotStr.split(' ');
  const day = parts[0];
  const month = parts[1];
  const shiftText = parts[2] + ' ' + parts[3];

  const examDate = `${month} ${day}`;
  const shift = shiftText as 'Shift 1' | 'Shift 2';

  return { examDate, shift, groupType: 'PCM' };
}

export default function HomePage() {
  const [appState, setAppState] = useState<AppState>('idle');
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [meta, setMeta] = useState<ExamMeta | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Slot and analytics state
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
            rawHtml: content, // Save raw html to Supabase database silently
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
    <>
      {/* Show upload section when idle/error/parsing, results when done */}
      {appState !== 'results' && (
        <>
          {/* Hero + Upload */}
          <section className="py-12 md:py-16 px-4">
            <div className="max-w-3xl mx-auto text-center">
              {/* CETify Large Hero Logo */}
              <div className="flex justify-center mb-6 animate-fade-in-up">
                <Image 
                  src="/logo.svg" 
                  alt="CETify Logo" 
                  width={206} 
                  height={60} 
                  className="object-contain"
                  priority 
                />
              </div>

              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 text-[#0f172a]">
                MHT CET Score Calculator
              </h1>
              <p className="text-gray-500 text-lg max-w-xl mx-auto mb-10">
                Upload your response sheet and instantly calculate your score. Stop waiting and start planning your next move with precision.
              </p>

              {appState === 'parsing' && <LoadingSpinner />}

              {appState === 'error' && (
                <div className="mb-8 bg-red-50 border border-red-200 rounded-xl p-6 text-left max-w-xl mx-auto animate-fade-in-up">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-red-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-red-800 mb-1">Parsing Error</p>
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleReset}
                    className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              )}

              {(appState === 'idle' || appState === 'error') && (
                <UploadDropzone 
                  onFileContent={handleFileContent} 
                  onFileSelectSilent={handleFileSelectSilent}
                />
              )}
            </div>
          </section>

          {/* Features */}
          <section className="py-16 px-4 border-t border-gray-100 bg-gray-50/50">
            <div className="max-w-5xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {features.map((f) => (
                  <div
                    key={f.title}
                    className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md hover:border-[#4338ca]/30 transition-all duration-300"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#eef2ff] text-[#4338ca] flex items-center justify-center mb-4">
                      {f.icon}
                    </div>
                    <h3 className="text-base font-bold text-[#0f172a] mb-2">{f.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Shift-wise Statistics Section */}
          <section className="py-16 px-4 border-t border-gray-100 bg-white">
            <div className="max-w-4xl mx-auto">
              <AllShiftsStats />
            </div>
          </section>
        </>
      )}

      {/* Results Dashboard */}
      {appState === 'results' && result && meta && examSlot && shiftStats && (
        <div id="results-section" className="py-8 px-4 bg-gray-50/30">
          <div className="max-w-5xl mx-auto space-y-6">
            
            {/* Score Card */}
            <div className="animate-fade-in-up">
              <ScoreCard
                totalMarks={result.totalMarks}
                maxMarks={result.maxMarks}
                percentage={result.percentage}
                onDownloadPdf={handleDownloadPdf}
              />
            </div>

            {/* Shift Analytics Card */}
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in-up delay-150">
              <div className="md:col-span-2">
                <SubjectBreakdown
                  physics={result.physics}
                  chemistry={result.chemistry}
                  maths={result.maths}
                />
              </div>
              <div>
                <ResultSummary result={result} meta={meta} layout="sidebar" />
              </div>
            </div>



            {/* Re-calculate Button */}
            <div className="flex justify-center pt-4 pb-12 animate-fade-in-up delay-300">
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 hover:border-gray-400 bg-white text-[#0f172a] text-sm font-semibold rounded-xl transition-all shadow-sm active:scale-95"
              >
                <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
                Calculate Another Score
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
