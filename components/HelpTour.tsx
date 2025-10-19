
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';

interface HelpTourProps {
  onClose: () => void;
}

const helpContent = `
This is an AI-powered tool to help you understand code complexity.

*   **Code Editor:** Write or paste your code in the main editor area.
*   **Analyze Button:** Click this to start the time complexity analysis. The overall complexity (e.g., $O(n^2)$) will appear in the status bar at the bottom.
*   **View Analysis (Document Icon):** After a successful analysis, this icon will appear in the status bar. Click it to see a detailed, line-by-line breakdown of execution counts.
*   **Optimize Button:** Click this to get AI-powered suggestions for improving your code's efficiency.
*   **Settings (Gear Icon):** Change the language detection mode, editor appearance, and application theme.

Get started by pasting some code and hitting "Analyze"!
`;

const HelpTour: React.FC<HelpTourProps> = ({ onClose }) => {
  return (
    <div 
      className="modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="bg-[var(--bg-secondary)] rounded-lg shadow-xl w-full max-w-lg m-4"
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-[var(--border-primary)] flex justify-between items-center">
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">Welcome!</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--bg-secondary)] focus:ring-[var(--ring-color)]"
            aria-label="Close help"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6 prose prose-invert max-w-none text-[var(--text-secondary)]">
          <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={[rehypeRaw, rehypeKatex]}
          >
              {helpContent}
          </ReactMarkdown>
        </div>
         <div className="p-4 bg-[var(--bg-secondary)] border-t border-[var(--border-primary)] flex justify-end">
            <button
              onClick={onClose}
              className="bg-[var(--bg-interactive)] hover:bg-[var(--bg-interactive-hover)] text-[var(--text-on-interactive)] font-semibold py-2 px-4 rounded-md transition-colors"
            >
                Got it!
            </button>
        </div>
      </div>
    </div>
  );
};

export default HelpTour;
