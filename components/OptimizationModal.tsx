
import React, { useState, useEffect, useMemo } from 'react';
import type { OptimizationResult } from '../types';

interface OptimizationModalProps {
  isLoading: boolean;
  result: OptimizationResult | null;
  onClose: () => void;
}

const OptimizationModal: React.FC<OptimizationModalProps> = ({ isLoading, result, onClose }) => {
  const [copyButtonText, setCopyButtonText] = useState('Copy Code');

  const codeToCopy = useMemo(() => {
    if (!result || !result.optimized) return null;
    const codeBlockRegex = /```(?:\w+\n)?([\s\S]+)```/;
    const match = result.suggestion.match(codeBlockRegex);
    return match ? match[1].trim() : null;
  }, [result]);

  useEffect(() => {
    // Reset button text if the result changes
    setCopyButtonText('Copy Code');
  }, [result]);

  const handleCopy = () => {
    if (!codeToCopy) return;
    navigator.clipboard.writeText(codeToCopy).then(() => {
      setCopyButtonText('Copied!');
      setTimeout(() => setCopyButtonText('Copy Code'), 2000);
    }).catch(err => {
      console.error('Failed to copy code: ', err);
      setCopyButtonText('Failed!');
       setTimeout(() => setCopyButtonText('Copy Code'), 2000);
    });
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl m-4 flex flex-col"
        style={{maxHeight: '80vh'}}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-gray-700 flex justify-between items-center shrink-0">
          <h2 className="text-xl font-semibold text-gray-100">Optimization Suggestion</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          {isLoading && (
            <div className="flex flex-col items-center justify-center text-center text-gray-400 h-48">
              <svg className="animate-spin h-8 w-8 text-indigo-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>The AI is thinking...</span>
              <span className="text-sm mt-1">Analyzing your code for optimizations.</span>
            </div>
          )}
          {result && (
            <div className="prose prose-invert prose-sm md:prose-base max-w-none">
              <p>{result.suggestion.replace(/```(?:\w+\n)?[\s\S]+```/, '').trim()}</p>
              {codeToCopy && (
                <pre className="bg-gray-900/70 rounded-md p-4 text-sm font-mono whitespace-pre-wrap">{codeToCopy}</pre>
              )}
            </div>
          )}
        </div>
        <div className="p-4 border-t border-gray-700 flex justify-end gap-4 shrink-0">
          {codeToCopy && (
             <button
                onClick={handleCopy}
                className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500"
              >
                {copyButtonText}
              </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold bg-gray-600 text-gray-100 rounded-md hover:bg-gray-500 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-gray-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default OptimizationModal;