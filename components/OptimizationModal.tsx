
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
                <pre key={index} className="bg-[var(--bg-primary)] rounded-md p-4 my-4 overflow-x-auto">
                    <code className="text-sm font-mono text-[var(--text-primary)]">{part.trim()}</code>
                </pre>
            );
        }
        return <p key={index} className="text-[var(--text-secondary)] whitespace-pre-wrap">{part}</p>;
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
        className="bg-[var(--bg-secondary)] rounded-lg shadow-xl w-full max-w-2xl m-4"
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-[var(--border-primary)] flex justify-between items-center">
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">
            {result.optimized ? 'Optimization Suggestion' : 'Analysis Complete'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--bg-secondary)] focus:ring-[var(--ring-color)]"
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
        <div className="p-4 bg-[var(--bg-secondary)] border-t border-[var(--border-primary)] flex justify-end">
            <button
              onClick={onClose}
              className="bg-[var(--bg-interactive)] hover:bg-[var(--bg-interactive-hover)] text-[var(--text-on-interactive)] font-semibold py-2 px-4 rounded-md transition-colors"
            >
                Close
            </button>
        </div>
      </div>
    </div>
  );
};

export default OptimizationModal;