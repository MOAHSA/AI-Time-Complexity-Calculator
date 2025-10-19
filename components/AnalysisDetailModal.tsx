import React, { useMemo, useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { AnalysisResult, ConcreteLanguage, LineAnalysis } from '../types';

interface AnalysisDetailModalProps {
  code: string;
  language: ConcreteLanguage | null;
  analysis: AnalysisResult | null;
  onClose: () => void;
}

const AnalysisDetailModal: React.FC<AnalysisDetailModalProps> = ({ code, language, analysis, onClose }) => {
  const [isFullScreen, setIsFullScreen] = useState(false);

  const analysisMap = useMemo(() => {
    const map = new Map<number, LineAnalysis>();
    if (analysis?.lines) {
      for (const line of analysis.lines) {
        map.set(line.lineNumber, line);
      }
    }
    return map;
  }, [analysis]);

  const getLineProps = (lineNumber: number) => {
    const lineAnalysis = analysisMap.get(lineNumber);
    const executionCount = lineAnalysis ? lineAnalysis.executionCount : '';
    
    // Check for terms the AI might use for non-code lines
    const isNonExecutable = /N\/A|Comment|Declaration|Blank|brace/i.test(executionCount);
    
    const countDisplay = executionCount ? `[${executionCount}]` : '[-]';

    return {
      'data-execution-count': countDisplay,
      className: `code-line ${isNonExecutable ? 'non-executable' : ''}`,
      style: { display: 'block' }, // Required for react-syntax-highlighter
    };
  };
  
  const langAlias: { [key in ConcreteLanguage]: string } = {
    python: 'python',
    java: 'java',
    cpp: 'cpp',
  };

  return (
    <div 
      className="modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div 
        className={`bg-[var(--bg-secondary)] flex flex-col transition-all duration-300 ease-in-out
          ${isFullScreen 
            ? 'w-screen h-screen' 
            : 'rounded-lg shadow-xl w-full max-w-4xl m-4 h-[90vh]'
          }`
        }
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-[var(--border-primary)] flex justify-between items-center flex-shrink-0 gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
              <h2 className="text-xl font-semibold text-[var(--text-primary)] whitespace-nowrap">
                  Analysis Details
              </h2>
              <span className="font-mono bg-[var(--bg-tertiary)] text-[var(--text-secondary)] px-2 py-1 rounded-md text-base truncate" title={analysis?.bigO || 'N/A'}>
                  {analysis?.bigO || 'N/A'}
              </span>
          </div>

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
        <div className="p-6 flex-grow overflow-auto analysis-code-view">
          <SyntaxHighlighter
            language={language ? langAlias[language] : 'text'}
            style={vscDarkPlus as any}
            showLineNumbers
            wrapLines
            lineProps={getLineProps}
          >
            {code}
          </SyntaxHighlighter>
        </div>
      </div>
    </div>
  );
};

export default AnalysisDetailModal;