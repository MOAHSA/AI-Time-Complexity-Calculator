import React from 'react';

interface OptimizeOptionsModalProps {
  onClose: () => void;
  onSelectStrategy: (strategy: 'analyze' | 'direct' | 'upload' | 'history') => void;
  hasAnalysis: boolean;
}

const OptionButton: React.FC<{
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}> = ({ title, description, icon, onClick, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="flex flex-col items-center justify-center text-center p-4 bg-[var(--bg-tertiary)] hover:bg-[var(--bg-quaternary)] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[var(--bg-tertiary)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--bg-secondary)] focus:ring-[var(--ring-color)]"
  >
    <div className="text-[var(--text-primary)] mb-2">{icon}</div>
    <h3 className="font-semibold text-[var(--text-primary)]">{title}</h3>
    <p className="text-xs text-[var(--text-tertiary)] mt-1">{description}</p>
  </button>
);

const OptimizeOptionsModal: React.FC<OptimizeOptionsModalProps> = ({ onClose, onSelectStrategy, hasAnalysis }) => {
  return (
    <div 
      className="modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="bg-[var(--bg-secondary)] rounded-lg shadow-xl w-full max-w-2xl m-4"
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-[var(--border-primary)] flex justify-between items-center">
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">Start Optimization</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--bg-secondary)] focus:ring-[var(--ring-color)]"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
                <OptionButton
                    onClick={() => onSelectStrategy('analyze')}
                    icon={<svg xmlns="http://www.w.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c.251.023.501.05.75.082a.75.75 0 01.75.75v5.714a2.25 2.25 0 00.659 1.591L14.25 14.5M14.25 14.5L19 19.25M14.25 14.5A2.25 2.25 0 0112 12.25v-5.714a2.25 2.25 0 00-.659-1.591L14.25 14.5z" /></svg>}
                    title="Analyze & Optimize"
                    description="Run a fresh analysis on the current code for the most accurate optimization."
                />
                <OptionButton
                    onClick={() => onSelectStrategy('direct')}
                    disabled={!hasAnalysis}
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>}
                    title="Use Last Analysis"
                    description="Use the results from the last analysis performed on this code."
                />
                <OptionButton
                    onClick={() => onSelectStrategy('history')}
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                    title="Choose from History"
                    description="Select a past analysis from the history sidebar to use as context."
                />
                <OptionButton
                    onClick={() => onSelectStrategy('upload')}
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" /></svg>}
                    title="Upload & Optimize"
                    description="Upload a code file from your device to analyze and optimize."
                />
            </div>
        </div>
      </div>
    </div>
  );
};

export default OptimizeOptionsModal;