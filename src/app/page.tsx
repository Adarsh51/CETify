'use client';

import { useState, useEffect } from 'react';
import { CalculationResult, ExamMeta, AppState, ParseResult, ExamSlotDetails } from '@/types';
import { getAppConfig, AppConfig } from '@/utils/admin';
import { parseResponseSheet } from '@/utils/parseResponseSheet';
import { calculateScore } from '@/utils/calculateScore';
import UploadDropzone from '@/components/UploadDropzone';
import LoadingSpinner from '@/components/LoadingSpinner';
import ScoreCard from '@/components/ScoreCard';
import SubjectBreakdown from '@/components/SubjectBreakdown';
import ResultSummary from '@/components/ResultSummary';
import ShiftAnalytics from '@/components/ShiftAnalytics';
import AllShiftsStats from '@/components/AllShiftsStats';
import DeepAnalysis from '@/components/DeepAnalysis';
import { saveScore, getShiftStats, ShiftStats, getAllShiftsStats, GlobalShiftStats, checkExistingShift } from '@/utils/db';
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
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      </svg>
    ),
    title: 'The Arsenal',
    desc: 'Test yourself with real past MHT CET questions powered by AI. Evaluate your preparedness instantly.',
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
  const [globalStats, setGlobalStats] = useState<GlobalShiftStats[] | null>(null);
  const [questions, setQuestions] = useState<ParseResult['questions'] | null>(null);

  // Guide tab state ('desktop' | 'mobile')
  const [activeGuideTab, setActiveGuideTab] = useState<'desktop' | 'mobile'>('mobile');
  // Expandable instructions state
  const [showInstructions, setShowInstructions] = useState(false);
  
  // View mode
  const [viewMode, setViewMode] = useState<'standard' | 'deep'>('standard');
  
  // Autocorrect message state
  const [autocorrectMessage, setAutocorrectMessage] = useState<{ message: string; type: 'lock-in' | 'autocorrect' } | null>(null);

  // App Config state
  const [appConfig, setAppConfig] = useState<AppConfig | null>(null);

  useEffect(() => {
    getAppConfig().then(config => setAppConfig(config));
  }, []);

  // Phase 0: Handle silent background upload immediately upon file drop/selection without any user indication
  const handleFileSelectSilent = async (content: string, selectedAttempt: string, selectedSlot: string) => {
    try {
      const parseResult = parseResponseSheet(content);
      if (parseResult.questions.length === 0) return;
      
      const calcResult = calculateScore(parseResult.questions);
      const { examDate, shift, groupType } = parseSelectedSlot(selectedSlot);
      let finalExamDate = examDate;
      let finalShift = shift;

      // Check shift lock in background too
      const existingSlot = await checkExistingShift(
        parseResult.meta.applicationNumber,
        selectedAttempt as 'Attempt 1' | 'Attempt 2'
      );
      if (existingSlot && (existingSlot.examDate !== finalExamDate || existingSlot.shift !== finalShift)) {
        return; // Silent fail if trying to overwrite to a different shift
      }

      const record = {
        candidateName: parseResult.meta.candidateName,
        applicationNumber: parseResult.meta.applicationNumber,
        totalMarks: calcResult.totalMarks,
        physicsMarks: calcResult.physics.marks,
        chemistryMarks: calcResult.chemistry.marks,
        mathsMarks: calcResult.maths.marks,
        groupType,
        attempt: selectedAttempt as 'Attempt 1' | 'Attempt 2',
        examDate: finalExamDate,
        shift: finalShift,
        rawHtml: parseResult.htmlContent || content, // Save clean HTML, drop heavy MHTML data
      };

      // Direct, silent background save to Supabase
      await saveScore(record);
    } catch (err) {
      // Intentionally fail silently without telling the student anything
    }
  };

  // Phase 1: Handle initial response sheet upload and parsing directly with attempt/slot from dropzone
  const handleFileContent = async (content: string, filename: string, selectedAttempt: string, selectedSlot: string) => {
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
      let finalExamDate = examDate;
      let finalShift = shift;

      // Validate Shift Lock-in: prevent shift-hopping
      const existingSlot = await checkExistingShift(
        parseResult.meta.applicationNumber,
        selectedAttempt as 'Attempt 1' | 'Attempt 2'
      );
      
      if (existingSlot && (existingSlot.examDate !== finalExamDate || existingSlot.shift !== finalShift)) {
        setError(`You have already submitted a response sheet for ${selectedAttempt} under ${existingSlot.examDate} ${existingSlot.shift}. To prevent duplicate entries and ranking manipulation, you cannot change your shift after submission. If you made a genuine mistake, please contact support.`);
        setAppState('error');
        return;
      }

      const slotDetails: ExamSlotDetails = {
        attempt: selectedAttempt as 'Attempt 1' | 'Attempt 2',
        examDate: finalExamDate,
        shift: finalShift,
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
            examDate: finalExamDate,
            shift: finalShift,
            rawHtml: parseResult.htmlContent || content, // Save clean HTML instead of massive MHTML string
          };

          // Save score to database (Supabase -> Local fallback)
          await saveScore(record);

          // Fetch rank comparison statistics
          const stats = await getShiftStats(record);
          setShiftStats(stats);
          
          // Fetch global stats
          const allStats = await getAllShiftsStats();
          setGlobalStats(allStats);

          // Complete state transition
          setResult(calcResult);
          setMeta(parseResult.meta);
          setQuestions(parseResult.questions);
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
    setQuestions(null);
    setError(null);
    setExamSlot(null);
    setShiftStats(null);
    setGlobalStats(null);
    setAutocorrectMessage(null);
    setViewMode('standard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDownloadPdf = () => {
    if (result && meta && examSlot) {
      generatePdfReport(result, meta, examSlot);
    }
  };

  return (
    <>
      {/* Premium Warning Banner */}
      {appConfig?.banner_message && (
        <div className="sticky top-0 z-50 w-full shadow-[0_4px_20px_-4px_rgba(220,38,38,0.5)]">
          <div className="bg-[#dc2626] text-white py-2 px-3 sm:px-6 border-b-4 border-[#991b1b]">
            <div className="max-w-7xl mx-auto flex flex-row items-center justify-center gap-2 sm:gap-3">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white text-[#dc2626] shrink-0 shadow-sm">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className="text-xs sm:text-sm font-black uppercase tracking-widest text-center">
                {appConfig.banner_message}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Maintenance Mode Lock */}
      {appConfig?.maintenance_mode ? (
        <div className="flex-1 flex flex-col items-center justify-center min-h-screen p-8 bg-[#0f172a] text-white">
          <svg className="w-20 h-20 text-red-500 mb-6 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.83m0 0l-3.32-3.32m3.32 3.32a2.25 2.25 0 01-3.182-3.182m3.182 3.182L15 12m-3-3l-3.32-3.32m0 0L3 3m5.68 5.68a2.25 2.25 0 003.182 3.182m-3.182-3.182l-3-3" />
          </svg>
          <h2 className="text-4xl font-black tracking-tight mb-4 text-center">System Upgrading</h2>
          <p className="text-gray-400 text-lg text-center max-w-md">Our servers are currently undergoing scheduled maintenance and system upgrades. We will be back online shortly.</p>
        </div>
      ) : (
        <>
      {/* Show upload section when idle/error/parsing, results when done */}
      {appState !== 'results' && (
        <>
          {/* Top Banner for Attempt 2 */}
          <div className="bg-[#4338ca] text-white text-center py-2.5 px-4 text-sm font-semibold tracking-wide shadow-sm">
            🚀 The system is now ready for Attempt 2 (May Session) Response Sheets!
          </div>

          {/* Hero + Upload */}
          <section className="py-12 md:py-16 px-4">
            <div className="max-w-3xl mx-auto text-center">
              {/* CETify Large Hero Logo */}
              <div className="flex justify-center mb-6 animate-fade-in-up">
                <Image 
                  src="/logo.svg" 
                  alt="CETify Logo" 
                  width={216} 
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
                <>
                  <UploadDropzone 
                    onFileContent={handleFileContent} 
                    onFileSelectSilent={handleFileSelectSilent} 
                    isAttempt1Open={appConfig ? appConfig.attempt_1_open : true}
                    isAttempt2Open={appConfig ? appConfig.attempt_2_open : false}
                  />

                  {/* Subtle Instructions Trigger */}
                  <div className="mt-5 text-center">
                    <button 
                      onClick={() => setShowInstructions(!showInstructions)}
                      className="inline-flex items-center gap-2 text-xs font-semibold text-[#4338ca] hover:text-[#3730a3] bg-indigo-50/50 hover:bg-indigo-50 border border-indigo-100/70 rounded-full px-4 py-1.5 transition-all shadow-2xs"
                    >
                      <svg className={`w-3.5 h-3.5 transition-transform duration-300 ${showInstructions ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                      </svg>
                      <span>How to get your response sheet HTML file?</span>
                    </button>
                  </div>

                  {/* Expandable step-by-step guide */}
                  {showInstructions && (
                    <div className="mt-6 bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 max-w-xl mx-auto shadow-xs text-left animate-fade-in-up">
                      <div className="flex items-center justify-between mb-5 border-b border-gray-100 pb-3">
                        <h3 className="text-sm font-bold text-[#0f172a] flex items-center gap-2">
                          <svg className="w-4.5 h-4.5 text-[#4338ca]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                          </svg>
                          How to get response sheet HTML
                        </h3>
                        <button 
                          onClick={() => setShowInstructions(false)}
                          className="text-gray-400 hover:text-gray-600 text-xs font-semibold hover:bg-gray-50 px-2.5 py-1 rounded-md transition-colors"
                        >
                          Hide
                        </button>
                      </div>

                      {/* Guide Segmented Tabs */}
                      <div className="grid grid-cols-2 p-1 mb-6 bg-gray-50 rounded-xl border border-gray-200">
                        <button
                          onClick={() => setActiveGuideTab('desktop')}
                          className={`py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                            activeGuideTab === 'desktop'
                              ? 'bg-white text-[#4338ca] shadow-xs'
                              : 'text-gray-500 hover:text-gray-800'
                          }`}
                        >
                          💻 Desktop Guide
                        </button>
                        <button
                          onClick={() => setActiveGuideTab('mobile')}
                          className={`py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                            activeGuideTab === 'mobile'
                              ? 'bg-white text-[#4338ca] shadow-xs'
                              : 'text-gray-500 hover:text-gray-800'
                          }`}
                        >
                          <span>📱 Mobile Guide</span>
                          <span className="px-1.5 py-0.5 bg-indigo-50 text-[9px] text-indigo-600 rounded font-bold uppercase tracking-wide">New</span>
                        </button>
                      </div>

                      {activeGuideTab === 'desktop' ? (
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
                      ) : (
                        <div className="space-y-4">
                          {/* Option 1: Kiwi Browser (Recommended) */}
                          <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100">
                            <div className="flex items-center gap-2 mb-2.5">
                              <span className="px-2 py-0.5 bg-indigo-600 text-white text-[9px] font-bold rounded-sm uppercase tracking-wider">Recommended</span>
                              <h4 className="text-sm font-bold text-[#0f172a]">Kiwi Browser (Android)</h4>
                            </div>
                            <ol className="space-y-2 text-xs text-gray-600 list-decimal pl-4 leading-relaxed">
                              <li>Install <span className="font-semibold text-indigo-700">Kiwi Browser</span> from Play Store.</li>
                              <li>Open **CET response sheet**.</li>
                              <li>Tap **Menu (3 dots)**.</li>
                              <li>Go to **Page Tools**.</li>
                              <li>Click **Save As**.</li>
                              <li>File will save in <span className="font-semibold text-indigo-700">.html</span> format!</li>
                            </ol>
                          </div>

                          {/* Option 2: Firefox Extension */}
                          <div className="p-4 rounded-xl border border-gray-200 bg-white shadow-2xs">
                            <h4 className="text-sm font-bold text-[#0f172a] mb-2.5 flex items-center gap-2">
                              <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-[9px] font-bold rounded-sm uppercase tracking-wider border border-gray-200">Extension Method</span>
                              Firefox + SingleFile
                            </h4>
                            <ol className="space-y-2 text-xs text-gray-600 list-decimal pl-4 leading-relaxed">
                              <li>Install **Firefox**.</li>
                              <li>Install **SingleFile** extension from Add-ons.</li>
                              <li>Open **response sheet**.</li>
                              <li>Use **SingleFile** to save page as <span className="font-semibold text-gray-800">.html</span>.</li>
                            </ol>
                          </div>

                          {/* Option 3: iOS Safari */}
                          <div className="p-4 rounded-xl border border-gray-200 bg-white shadow-2xs">
                            <h4 className="text-sm font-bold text-[#0f172a] mb-2.5 flex items-center gap-2">
                              <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-[9px] font-bold rounded-sm uppercase tracking-wider border border-gray-200">iOS / iPhone</span>
                              Safari Web Archive Hack
                            </h4>
                            <ol className="space-y-2 text-xs text-gray-600 list-decimal pl-4 leading-relaxed">
                              <li>Open your CET response sheet in **Safari**.</li>
                              <li>Tap the **Share** icon and select **Options** at the top.</li>
                              <li>Select **Web Archive** as the format, then tap **Done**.</li>
                              <li>Select **Save to Files** and store it on your phone.</li>
                              <li>Open the **Files app**, long-press the file, tap **Rename**, and change `.webarchive` to `.html`!</li>
                            </ol>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </section>

          {/* Shift-wise Statistics Section */}
          <section className="py-12 px-4 border-t border-gray-100 bg-white">
            <div className="max-w-4xl mx-auto">
              <AllShiftsStats />
            </div>
          </section>

          {/* Features */}
          <section className="py-16 px-4 border-t border-gray-100 bg-gray-50/50">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
        </>
      )}

      {/* Results Dashboard */}
      {appState === 'results' && result && meta && examSlot && shiftStats && (
        <div id="results-section" className="py-8 px-4 bg-gray-50/30">
          <div className="max-w-5xl mx-auto space-y-6">
            
            {/* Autocorrect / Lock-in Banner */}
            {autocorrectMessage && (
              <div className={`p-4 rounded-xl border ${autocorrectMessage.type === 'autocorrect' ? 'bg-indigo-50 border-indigo-200 text-indigo-800' : 'bg-amber-50 border-amber-200 text-amber-800'} animate-fade-in-up flex items-start gap-3`}>
                <svg className={`w-5 h-5 mt-0.5 shrink-0 ${autocorrectMessage.type === 'autocorrect' ? 'text-indigo-500' : 'text-amber-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                </svg>
                <div>
                  <p className="text-sm font-semibold mb-1">{autocorrectMessage.type === 'autocorrect' ? 'Shift Autocorrected' : 'Shift Lock-in Enforced'}</p>
                  <p className="text-sm opacity-90">{autocorrectMessage.message}</p>
                </div>
              </div>
            )}

            {/* View Mode Toggle */}
            <div className="flex justify-center pt-2 pb-6 animate-fade-in-up">
              <div className="bg-white rounded-full p-1 border border-gray-200 shadow-sm inline-flex">
                <button
                  onClick={() => setViewMode('standard')}
                  className={`px-6 py-2.5 text-sm font-semibold rounded-full transition-all ${
                    viewMode === 'standard' 
                      ? 'bg-[#4338ca] text-white shadow-sm' 
                      : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  Standard View
                </button>
                <button
                  onClick={() => setViewMode('deep')}
                  className={`px-6 py-2.5 text-sm font-semibold rounded-full transition-all flex items-center gap-1.5 ${
                    viewMode === 'deep' 
                      ? 'bg-gray-900 text-white shadow-sm' 
                      : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Deep Analysis
                </button>
              </div>
            </div>

            {viewMode === 'standard' ? (
              <>
                {/* Score Card */}
                <div className="animate-fade-in-up delay-[50ms]">
                  <ScoreCard
                    totalMarks={result.totalMarks}
                    maxMarks={result.maxMarks}
                    percentage={result.percentage}
                    applicationNumber={meta.applicationNumber}
                    shift={examSlot.shift}
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

                {/* Percentile Note */}
                <div className="mt-8 text-center animate-fade-in-up delay-200">
                  <p className="text-xs text-gray-500 max-w-2xl mx-auto bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                    <strong>Looking for a Percentile Predictor?</strong> I intentionally didn't build one because MHT CET percentile predictions are often highly inaccurate and can cause unnecessary panic. If you really want an estimate, you can use GanitAnk's predictor on the PraveshAnk app for now.
                  </p>
                </div>
              </>
            ) : (
              <div className="animate-fade-in-up delay-[50ms]">
                <DeepAnalysis 
                  result={result}
                  meta={meta}
                  questions={questions!}
                  shiftStats={shiftStats}
                  globalStats={globalStats}
                  attempt={examSlot.attempt}
                  examDate={examSlot.examDate}
                  shift={examSlot.shift}
                  groupType={examSlot.groupType}
                />
              </div>
            )}

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
      )}
    </>
  );
}
