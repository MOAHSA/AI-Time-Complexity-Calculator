
import React from 'react';

interface HelpTourProps {
  onClose: () => void;
}

const HelpTour: React.FC<HelpTourProps> = ({ onClose }) => {
  return (
    <div 
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
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
        <div className="p-6 text-[var(--text-secondary)] space-y-4">
          <p>This is an AI-powered tool to help you understand code complexity.</p>
          <ul className="list-disc list-inside space-y-2">
            <li><strong>Code Editor:</strong> Write or paste your code in the main editor area. After running an analysis, **click on any line number** to see its specific execution count.</li>
            <li><strong>Analyze Button:</strong> Click this to start the time complexity analysis. The overall Big O will appear in the status bar at the bottom.</li>
            <li><strong>Optimize Button:</strong> After analyzing, click this to get AI-powered suggestions for improving your code's efficiency.</li>
            <li><strong>Settings (Gear Icon):</strong> Change the language detection mode, editor appearance, and application theme.</li>
          </ul>
          <p>Get started by pasting some code and hitting "Analyze"!</p>
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