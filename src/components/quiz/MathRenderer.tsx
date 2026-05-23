'use client';

import React from 'react';
import 'katex/dist/katex.min.css';
import Latex from 'react-latex-next';

interface MathRendererProps {
  content: string;
  className?: string;
}

/**
 * MathRenderer component for safely rendering LaTeX mathematical formulas
 * using KaTeX via react-latex-next.
 * 
 * It supports inline math ($...$) and display math ($$...$$).
 */
export default function MathRenderer({ content, className = '' }: MathRendererProps) {
  if (!content) return null;

  // Sometimes the AI returns raw LaTeX without delimiters (e.g. "W = \\frac{T}{R}").
  // If the content doesn't have any delimiters but contains LaTeX-like backslashes, wrap it.
  let processedContent = content;
  const hasDelimiters = /\$|\\\(|\\\[/.test(content);
  const hasLatexCommands = /\\[a-zA-Z]+|[_^]/.test(content);
  
  if (!hasDelimiters && hasLatexCommands) {
    processedContent = `$${content}$`;
  }

  return (
    <div className={`math-renderer ${className}`}>
      <Latex>{processedContent}</Latex>
    </div>
  );
}
