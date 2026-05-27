'use client';

import React, { useState, useEffect, useRef } from 'react';
import QuizSetup from '@/components/quiz/QuizSetup';
import QuestionCard from '@/components/quiz/QuestionCard';
import MathRenderer from '@/components/quiz/MathRenderer';
import QuestionPalette, { QuestionStatus } from '@/components/quiz/QuestionPalette';
import QuizSummary from '@/components/quiz/QuizSummary';
import { getQuizQuestions, getRandomQuizQuestions, QuizQuestion } from '@/utils/quiz';

type QuizState = 'setup' | 'loading' | 'playing' | 'summary';

export default function QuizPageContent() {
  const IS_LOCKED = true; // Security Lock
  const [showLockedAlert, setShowLockedAlert] = useState(false);
  const [quizState, setQuizState] = useState<QuizState>('setup');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  
  // Exam State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [statuses, setStatuses] = useState<Record<string, QuestionStatus>>({});
  
  // Timer State
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // UI State
  const [isMobilePaletteOpen, setIsMobilePaletteOpen] = useState(false);
  const [isReviewMode, setIsReviewMode] = useState(false); // Used in summary to review answers

  // Start Exam
  const handleStartQuiz = async (shift: string, subject: string | null, count: number) => {
    if (IS_LOCKED) {
      setShowLockedAlert(true);
      return;
    }

    setQuizState('loading');
    
    let fetched: QuizQuestion[] = [];
    if (shift === 'random') {
      fetched = await getRandomQuizQuestions(count, subject);
    } else {
      const [examDate, shiftName] = shift.split('|');
      fetched = await getQuizQuestions(examDate, shiftName, subject);
      if (fetched.length > count) {
        fetched = fetched.sort(() => 0.5 - Math.random()).slice(0, count);
      }
    }
    
    if (fetched.length === 0) {
      alert("No questions found for this selection. Please try another.");
      setQuizState('setup');
      return;
    }

    setQuestions(fetched);
    setCurrentIndex(0);
    setAnswers({});
    
    const initialStatuses: Record<string, QuestionStatus> = {};
    fetched.forEach((q, idx) => {
      initialStatuses[q.id] = idx === 0 ? 'unanswered' : 'not_visited';
    });
    setStatuses(initialStatuses);
    
    const totalMinutes = (subject && subject !== 'All') ? 90 : 180;
    setTimeLeft(totalMinutes * 60);
    
    setQuizState('playing');
    setIsReviewMode(false);
  };

  useEffect(() => {
    if (quizState === 'playing' && timeLeft > 0) {
      timerRef.current = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (quizState === 'playing' && timeLeft <= 0) {
      handleSubmitTest();
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [quizState, timeLeft]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentQ = questions[currentIndex];

  const handleSelectOption = (optionId: string) => {
    setAnswers(prev => ({ ...prev, [currentQ.id]: optionId }));
  };

  const handleClearResponse = () => {
    setAnswers(prev => {
      const next = { ...prev };
      delete next[currentQ.id];
      return next;
    });
    setStatuses(prev => {
      const currentStatus = prev[currentQ.id];
      const newStatus = currentStatus === 'answered_marked' || currentStatus === 'marked_for_review' 
        ? 'marked_for_review' 
        : 'unanswered';
      return { ...prev, [currentQ.id]: newStatus };
    });
  };

  const goToNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      const nextQ = questions[currentIndex + 1];
      setCurrentIndex(currentIndex + 1);
      setStatuses(prev => {
        if (!prev[nextQ.id] || prev[nextQ.id] === 'not_visited') {
          return { ...prev, [nextQ.id]: 'unanswered' };
        }
        return prev;
      });
    }
  };

  const handleSaveAndNext = () => {
    setStatuses(prev => ({
      ...prev,
      [currentQ.id]: answers[currentQ.id] ? 'answered' : 'unanswered'
    }));
    goToNextQuestion();
  };

  const handleMarkForReviewAndNext = () => {
    setStatuses(prev => ({
      ...prev,
      [currentQ.id]: answers[currentQ.id] ? 'answered_marked' : 'marked_for_review'
    }));
    goToNextQuestion();
  };

  const handleSelectQuestionFromPalette = (index: number) => {
    setCurrentIndex(index);
    const selectedQ = questions[index];
    setStatuses(prev => {
      const updatedStatuses = { ...prev };
      if (answers[currentQ.id] && (prev[currentQ.id] === 'unanswered' || prev[currentQ.id] === 'not_visited')) {
         updatedStatuses[currentQ.id] = 'answered';
      }
      if (!updatedStatuses[selectedQ.id] || updatedStatuses[selectedQ.id] === 'not_visited') {
        updatedStatuses[selectedQ.id] = 'unanswered';
      }
      return updatedStatuses;
    });
  };

  const handleSubmitTest = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (answers[currentQ.id] && (statuses[currentQ.id] === 'unanswered' || statuses[currentQ.id] === 'not_visited')) {
      setStatuses(prev => ({ ...prev, [currentQ.id]: 'answered' }));
    }
    setQuizState('summary');
  };

  const handleRetry = () => {
    setQuizState('setup');
  };

  const handleReviewSolutions = () => {
    setIsReviewMode(true);
    setCurrentIndex(0);
  };

  const goToReviewNext = () => {
    if (currentIndex < questions.length - 1) setCurrentIndex(prev => prev + 1);
  };
  
  const goToReviewPrev = () => {
    if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
  };

  return (
    <div className="min-h-[85vh] bg-[#f3f4f6] flex flex-col pointer-events-none select-none" style={{ filter: 'grayscale(0.5)' }}>
      {quizState === 'setup' && (
        <div className="py-12 px-4 pointer-events-none">
          <QuizSetup onStart={handleStartQuiz} isLocked={IS_LOCKED} />
        </div>
      )}
      
      {quizState === 'loading' && (
        <div className="flex-1 flex flex-col items-center justify-center p-20 pointer-events-none">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-[#4338ca] rounded-full animate-spin mb-4"></div>
          <p className="text-gray-500 font-medium animate-pulse">Building your CBT interface...</p>
        </div>
      )}
      
      {quizState === 'playing' && questions.length > 0 && (
        <div className="flex-1 flex flex-col h-[85vh] overflow-hidden pointer-events-none">
          <header className="bg-white border-b border-gray-200 shrink-0 px-4 h-16 flex items-center justify-between shadow-sm z-20">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#4338ca] rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h1 className="font-bold text-gray-800 hidden sm:block">CETify Practice Exam</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-red-50 text-red-700 px-3 py-1.5 rounded-lg border border-red-100 font-mono font-bold text-lg">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {formatTime(timeLeft)}
              </div>
              <button 
                onClick={() => setIsMobilePaletteOpen(true)}
                className="lg:hidden p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
              </button>
            </div>
          </header>

          <div className="flex-1 flex overflow-hidden max-w-[1400px] mx-auto w-full">
            <main className="flex-1 flex flex-col h-full bg-white lg:border-r lg:border-l border-gray-200 relative">
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50/50">
                <QuestionCard 
                  key={currentQ.id}
                  question={currentQ}
                  questionNumber={currentIndex + 1}
                  selectedOptionId={answers[currentQ.id] || null}
                  onSelectOption={handleSelectOption}
                />
              </div>

              <div className="shrink-0 bg-white border-t border-gray-200 p-4 flex flex-wrap items-center justify-between gap-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                  <button onClick={handleMarkForReviewAndNext} className="flex-1 sm:flex-none px-4 py-2.5 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors text-sm">Mark for Review & Next</button>
                  <button onClick={handleClearResponse} className="flex-1 sm:flex-none px-4 py-2.5 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors text-sm">Clear Response</button>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button onClick={handleSaveAndNext} className="flex-1 sm:flex-none px-6 py-2.5 bg-[#4338ca] text-white font-bold rounded-lg hover:bg-[#3730a3] transition-colors shadow-sm text-sm">Save & Next</button>
                  <button onClick={() => { if (window.confirm("Are you sure you want to submit the test?")) handleSubmitTest(); }} className="flex-1 sm:flex-none px-6 py-2.5 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors shadow-sm text-sm">Submit</button>
                </div>
              </div>
            </main>

            <QuestionPalette 
              totalQuestions={questions.length}
              currentIndex={currentIndex}
              statuses={statuses}
              questionIds={questions.map(q => q.id)}
              onSelectQuestion={handleSelectQuestionFromPalette}
              isMobileOpen={isMobilePaletteOpen}
              onCloseMobile={() => setIsMobilePaletteOpen(false)}
            />
          </div>
        </div>
      )}
      
      {quizState === 'summary' && !isReviewMode && (
        <div className="py-12 px-4 pointer-events-none">
          <QuizSummary 
            questions={questions}
            answers={answers}
            statuses={statuses}
            onRetry={handleRetry}
            onReviewSolutions={handleReviewSolutions}
          />
        </div>
      )}

      {isReviewMode && (
        <div className="min-h-screen bg-gray-50 py-8 px-4 pointer-events-none">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Review Solutions</h2>
              <button onClick={() => setQuizState('summary')} className="text-[#4338ca] font-bold hover:underline">&larr; Back to Results</button>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
               <div className="mb-4 flex justify-between items-center">
                 <span className="font-bold text-gray-700">Question {currentIndex + 1} of {questions.length}</span>
                 <span className={`px-2 py-1 text-xs font-bold rounded ${answers[currentQ.id] === currentQ.correct_option_id ? 'bg-green-100 text-green-800' : answers[currentQ.id] ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-600'}`}>
                    {answers[currentQ.id] === currentQ.correct_option_id ? 'Correct' : answers[currentQ.id] ? 'Incorrect' : 'Unattempted'}
                 </span>
               </div>
               
               <QuestionCard 
                  key={`review-${currentQ.id}`}
                  question={currentQ}
                  questionNumber={currentIndex + 1}
                  selectedOptionId={answers[currentQ.id] || null}
                  onSelectOption={() => {}}
                />

                <div className="mt-6 p-6 bg-blue-50 border border-blue-100 rounded-xl">
                  <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Explanation
                  </h4>
                  <div className="text-gray-800 text-sm leading-relaxed">
                    <MathRenderer content={currentQ.explanation} />
                  </div>
                </div>
            </div>

            <div className="flex justify-between">
              <button onClick={goToReviewPrev} disabled={currentIndex === 0} className="px-6 py-2 bg-white border border-gray-300 rounded-lg font-bold disabled:opacity-50">Previous</button>
              <button onClick={goToReviewNext} disabled={currentIndex === questions.length - 1} className="px-6 py-2 bg-[#4338ca] text-white rounded-lg font-bold disabled:opacity-50">Next</button>
            </div>
          </div>
        </div>
      )}

      {/* 🔒 DevTools Bypass Security Modal */}
      {showLockedAlert && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-all duration-300 animate-in fade-in pointer-events-auto">
          <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-white/60 p-8 max-w-md w-full text-center relative overflow-hidden transform transition-all duration-300 scale-100 animate-in zoom-in-95 pointer-events-auto">
            {/* Elegant glowing background circle */}
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none"></div>

            {/* Lock Icon Wrapper */}
            <div className="w-16 h-16 mx-auto bg-indigo-50 border border-indigo-100/50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-inner mb-6 relative">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>

            {/* Content */}
            <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-3">
              Nice Try! 😉
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed mb-6">
              CETify Arsenal is securely locked during development. The questions and exam engine cannot be accessed right now. 
              <br />
              <span className="block mt-2 font-medium text-indigo-600">Get ready to unlock the ultimate MHT CET training ground very soon!</span>
            </p>

            {/* Action Button */}
            <button
              onClick={() => setShowLockedAlert(false)}
              className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 hover:from-indigo-700 hover:to-indigo-800 transition-all active:scale-[0.98] cursor-pointer"
            >
              Back to Safety
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
