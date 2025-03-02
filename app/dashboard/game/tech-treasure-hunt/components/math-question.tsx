import React from 'react';

interface MathQuestionProps {
  question: string;
  questionNumber: number;
}

export function MathQuestion({ question, questionNumber }: MathQuestionProps) {
  // Format the question for better display
  const formattedQuestion = question
    .replace(/\+/g, ' + ')
    .replace(/\-/g, ' - ')
    .replace(/\×/g, ' × ')
    .replace(/\÷/g, ' ÷ ');

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 shadow-sm p-8 text-center">
      <div className="mb-2 text-sm font-medium text-gray-500">Problem #{questionNumber}</div>
      <div className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
        {formattedQuestion} = ?
      </div>
    </div>
  );
}
