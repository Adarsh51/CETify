'use client';

import React from 'react';

export type QuestionStatus = 'not_visited' | 'unanswered' | 'answered' | 'marked_for_review' | 'answered_marked';

interface QuestionPaletteProps {
  totalQuestions: number;
  currentIndex: number;
  statuses: Record<string, QuestionStatus>;
  questionIds: string[];
  onSelectQuestion: (index: number) => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export default function QuestionPalette({
  totalQuestions,
  currentIndex,
  statuses,
  questionIds,
  onSelectQuestion,
  isMobileOpen,
  onCloseMobile
}: QuestionPaletteProps) {
  // Count statuses
  let answered = 0;
  let unanswered = 0;
  let markedForReview = 0;
  let answeredMarked = 0;
  let notVisited = 0;

  questionIds.forEach((id) => {
    const status = statuses[id] || 'not_visited';
    if (status === 'answered') answered++;
    else if (status === 'unanswered') unanswered++;
    else if (status === 'marked_for_review') markedForReview++;
    else if (status === 'answered_marked') answeredMarked++;
    else notVisited++;
  });

  const getStatusClasses = (index: number) => {
    const id = questionIds[index];
    const status = statuses[id] || 'not_visited';
    const isActive = index === currentIndex;

    let base = "w-10 h-10 flex items-center justify-center font-semibold text-sm rounded-md transition-all border-2 cursor-pointer";
    let statusClass = "";

    switch (status) {
      case 'answered':
        statusClass = "bg-green-500 border-green-600 text-white";
        break;
      case 'unanswered':
        statusClass = "bg-red-500 border-red-600 text-white";
        break;
      case 'marked_for_review':
        statusClass = "bg-purple-500 border-purple-600 text-white";
        break;
      case 'answered_marked':
        statusClass = "bg-purple-500 border-green-400 text-white relative overflow-hidden";
        break;
      case 'not_visited':
      default:
        statusClass = "bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200";
        break;
    }

    if (isActive) {
      base += " ring-2 ring-offset-2 ring-[#4338ca] transform scale-110";
    }

    return `${base} ${statusClass}`;
  };

  const paletteContent = (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
        <h3 className="font-bold text-gray-800">Question Palette</h3>
        <button className="lg:hidden text-gray-500 hover:text-gray-900" onClick={onCloseMobile}>
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="p-4 grid grid-cols-2 gap-y-3 gap-x-2 text-xs font-medium text-gray-600 border-b border-gray-100 bg-white">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-green-500 border border-green-600 rounded-sm flex items-center justify-center text-white text-[10px]">{answered}</div>
          <span>Answered</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-red-500 border border-red-600 rounded-sm flex items-center justify-center text-white text-[10px]">{unanswered}</div>
          <span>Not Answered</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-gray-100 border border-gray-300 rounded-sm flex items-center justify-center text-gray-600 text-[10px]">{notVisited}</div>
          <span>Not Visited</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-purple-500 border border-purple-600 rounded-sm flex items-center justify-center text-white text-[10px]">{markedForReview}</div>
          <span>Marked</span>
        </div>
        <div className="flex items-center gap-2 col-span-2">
          <div className="w-5 h-5 bg-purple-500 border border-green-400 rounded-sm flex items-center justify-center text-white text-[10px] relative overflow-hidden">
            <div className="absolute bottom-0 right-0 w-2 h-2 bg-green-400 rounded-tl-sm"></div>
            {answeredMarked}
          </div>
          <span>Answered & Marked for Review</span>
        </div>
      </div>

      <div className="p-4 overflow-y-auto flex-1">
        <div className="grid grid-cols-5 gap-2 sm:gap-3">
          {Array.from({ length: totalQuestions }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                onSelectQuestion(idx);
                if (window.innerWidth < 1024) onCloseMobile();
              }}
              className={getStatusClasses(idx)}
            >
              {idx + 1}
              {statuses[questionIds[idx]] === 'answered_marked' && (
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-tl-sm"></div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop fixed sidebar */}
      <div className="hidden lg:block w-72 lg:w-80 shrink-0 h-[calc(100vh-8rem)] sticky top-24">
        {paletteContent}
      </div>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Mobile sliding drawer */}
      <div className={`fixed inset-y-0 right-0 w-[85vw] sm:w-80 bg-white z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${isMobileOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        {paletteContent}
      </div>
    </>
  );
}
