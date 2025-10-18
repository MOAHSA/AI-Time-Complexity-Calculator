
import React from 'react';
import type { OptimizationResult } from '../types';

interface OptimizationModalProps {
  result: OptimizationResult | null;
  onClose: () => void;
}

const OptimizationModal: React.FC<OptimizationModalProps> = ({ result, onClose }) => {
  if (!result) return null;

  const renderSuggestion = () => {
    // Basic markdown code block rendering
    const parts = result.suggestion.split(/```(?:\w+\n)?([\s\S]*?)```/);
    return parts.map((part, index) => {
        if (index % 2 === 1) { // This is a code block
            return (
                <pre key={index} className="bg-gray-900 rounded-md p-4 my-4 overflow-x-auto">
                    <code className="text-sm font-mono text-gray-100">{part.trim()}</code>
                </pre>
            );
        }
        return <p key={index} className="text-gray-300 whitespace-pre-wrap">{part}</p>;
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
        className="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl m-4"
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-100">
            {result.optimized ? 'Optimization Suggestion' : 'Analysis Complete'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500"
            aria-label="Close optimization results"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {renderSuggestion()}
        </div>
        <div className="p-4 bg-gray-800 border-t border-gray-700 flex justify-end">
            <button
              onClick={onClose}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md transition-colors"
            >
                Close
            </button>
        </div>
      </div>
    </div>
  );
};

export default OptimizationModal;
