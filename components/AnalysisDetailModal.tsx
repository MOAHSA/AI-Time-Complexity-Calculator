import React, { useState } from 'react';
import type { AnalysisResult, ConcreteLanguage } from '../types';

interface AnalysisDetailModalProps {
  code: string;
  language: ConcreteLanguage | null;
  analysis: AnalysisResult | null;
  onClose: () => void;
}

const AnalysisDetailModal: React.FC<AnalysisDetailModalProps> = ({ code, language, analysis, onClose }) => {
  const [isFullScreen, setIsFullScreen] = useState(false);

  if (!analysis) return null;

  const codeLines = code.split('\n');

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div 
        className={`bg-[var(--bg-secondary)] flex flex-col transition-all duration-300 ease-in-out
          ${isFullScreen 
            ? 'w-screen h-screen rounded-none m-0' 
            : 'rounded-lg shadow-xl w-full max-w-4xl m-4 max-h-[90vh]'
          }`
        }
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-[var(--border-primary)] flex justify-between items-center flex-shrink-0">
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">
            Analysis Details - <span className="font-mono bg-[var(--bg-tertiary)] text-[var(--text-secondary)] px-2 py-1 rounded-md">{analysis.bigO}</span>
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsFullScreen(p => !p)}
              className="p-2 rounded-full text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--bg-secondary)] focus:ring-[var(--ring-color)]"
              aria-label={isFullScreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullScreen ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 4H4v4m12 12h4v-4M8 20H4v-4m12-12h4V8" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4h4m12 4V4h-4M4 16v4h4m12-4v4h-4" />
                </svg>
              )}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--bg-secondary)] focus:ring-[var(--ring-color)]"
              aria-label="Close analysis details"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <div className="p-6 overflow-y-auto flex-grow">
          <div className={`mx-auto w-full ${isFullScreen ? 'max-w-6xl' : ''}`}>
            <table className="w-full text-left font-mono text-sm">
              <thead className="sticky top-0 bg-[var(--bg-secondary)]">
                <tr>
                  <th className="p-2 w-12 text-[var(--text-tertiary)]">Line</th>
                  <th className="p-2 text-[var(--text-tertiary)]">Code</th>
                  <th className="p-2 w-24 text-center text-[var(--text-tertiary)]">Executions</th>
                  <th className="p-2 text-[var(--text-tertiary)]">Analysis</th>
                </tr>
              </thead>
              <tbody>
                {analysis.lines.map((line, index) => (
                  <tr key={index} className="border-t border-[var(--border-primary)] hover:bg-[var(--bg-tertiary)]">
                    <td className="p-2 text-center text-[var(--text-tertiary)]">{line.lineNumber}</td>
                    <td className="p-2">
                      <pre className="whitespace-pre-wrap text-[var(--text-primary)]"><code>{codeLines[index] || ''}</code></pre>
                    </td>
                    <td className="p-2 text-center text-[var(--text-secondary)]">{line.executionCount}</td>
                    <td className="p-2 text-[var(--text-secondary)]">{line.analysis}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="p-4 bg-[var(--bg-secondary)] border-t border-[var(--border-primary)] flex justify-end flex-shrink-0">
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

export default AnalysisDetailModal;