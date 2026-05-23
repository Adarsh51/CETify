'use client';

import React from 'react';
import MathRenderer from './MathRenderer';
import type { QuizQuestion } from '@/utils/quiz';

interface QuestionCardProps {
  question: QuizQuestion;
  questionNumber: number;
  selectedOptionId: string | null;
  onSelectOption: (optionId: string) => void;
}

export default function QuestionCard({ 
  question, 
  questionNumber, 
  selectedOptionId, 
  onSelectOption 
}: QuestionCardProps) {
  
  // Parse options for rendering
  const options = [
    { id: question.option_1_id, text: question.option_1_text, label: 'A' },
    { id: question.option_2_id, text: question.option_2_text, label: 'B' },
    { id: question.option_3_id, text: question.option_3_text, label: 'C' },
    { id: question.option_4_id, text: question.option_4_text, label: 'D' },
  ].filter(opt => opt.id);

  const getSubjectColor = (subject: string) => {
    switch (subject.toLowerCase()) {
      case 'physics': return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'chemistry': return 'text-green-700 bg-green-50 border-green-200';
      case 'mathematics': return 'text-purple-700 bg-purple-50 border-purple-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const positiveMarks = question.subject.toLowerCase() === 'mathematics' ? '+2' : '+1';

  return (
    <div className="w-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between p-4 border-b border-gray-200 bg-gray-50/80">
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold text-gray-900">
            Question {questionNumber}
          </span>
          <span className={`px-2.5 py-0.5 rounded text-xs font-bold border ${getSubjectColor(question.subject)} uppercase tracking-wider`}>
            {question.subject}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-2 sm:mt-0">
          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-bold rounded">
            Correct: {positiveMarks}
          </span>
          <span className="px-2 py-1 bg-gray-200 text-gray-600 text-xs font-bold rounded">
            Wrong: -0
          </span>
        </div>
      </div>

      {/* Question Body */}
      <div className="p-5 md:p-8 overflow-y-auto flex-1">
        <div className="text-base md:text-lg text-gray-900 mb-8 leading-relaxed">
          <MathRenderer content={question.question_text} />
          
          {/* Fallback image if AI marked a diagram */}
          {question.question_text.includes('[FIGURE]') && question.question_image_url && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200 inline-block">
              <p className="text-xs text-gray-500 mb-2 font-bold uppercase tracking-wider">Reference Image</p>
              <img src={question.question_image_url} alt="Question figure" className="max-w-full rounded" />
            </div>
          )}
        </div>

        {/* Options */}
        <div className="space-y-3">
          {options.map((option) => (
            <label
              key={option.id}
              className={`flex items-start p-4 rounded-xl border-2 cursor-pointer transition-all ${
                selectedOptionId === option.id 
                  ? 'border-[#4338ca] bg-[#eef2ff]' 
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 bg-white'
              }`}
            >
              <div className="flex items-center h-full pt-1">
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={option.id}
                  checked={selectedOptionId === option.id}
                  onChange={() => onSelectOption(option.id)}
                  className="w-5 h-5 text-[#4338ca] border-gray-300 focus:ring-[#4338ca] mt-0.5"
                />
              </div>
              <div className="ml-4 flex-1 text-[15px] text-gray-800">
                <MathRenderer content={option.text} />
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
