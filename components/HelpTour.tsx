import React from 'react';

interface HelpTourProps {
  onClose: () => void;
}

const HelpTour: React.FC<HelpTourProps> = ({ onClose }) => {
  return (
    <div 
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="bg-[var(--bg-secondary)] rounded-lg shadow-xl w-full max-w-2xl m-4 flex flex-col max-h-[90vh]"
      >
        <div className="p-6 border-b border-[var(--border-primary)] flex justify-between items-center flex-shrink-0">
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">Welcome to the Code Analyzer!</h2>
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
        <div className="p-6 space-y-4 overflow-y-auto text-[var(--text-secondary)]">
          <p>This tool helps you understand and improve your code's performance.</p>
          
          <h3 className="text-lg font-semibold text-[var(--text-primary)] pt-2">How to Use:</h3>
          <ol className="list-decimal list-inside space-y-2">
            <li>
              <strong>Write or Paste Code:</strong> Start by writing your code in the editor. You can also upload a file or extract code from an image using the buttons in the status bar.
            </li>
            <li>
              <strong>Select Language:</strong> Use the settings (gear icon) to select your programming language (Python, Java, C++) or leave it on "Auto" for automatic detection.
            </li>
            <li>
              <strong>Analyze:</strong> Click the <span className="font-semibold text-[var(--text-on-interactive)] bg-[var(--bg-interactive)] px-2 py-0.5 rounded">Analyze</span> button. This will provide a line-by-line breakdown of your code's time complexity.
            </li>
            <li>
              <strong>Optimize:</strong> Click the <span className="font-semibold text-[var(--text-secondary)] bg-[var(--bg-tertiary)] px-2 py-0.5 rounded">Optimize</span> button. Our AI will suggest improvements to your code's performance and provide learning resources.
            </li>
            <li>
              <strong>Chat with AI:</strong> After getting an optimization suggestion, you can ask follow-up questions in the chat to deepen your understanding.
            </li>
             <li>
              <strong>View History:</strong> Access your past analyses and optimizations using the history (clock) icon.
            </li>
          </ol>

          <h3 className="text-lg font-semibold text-[var(--text-primary)] pt-2">Settings:</h3>
           <p>
             Click the <span className="font-bold">gear icon</span> in the status bar to customize the editor's theme, font, and the AI model preference (Quality vs. Speed).
           </p>
        </div>
        <div className="p-4 bg-[var(--bg-secondary)] border-t border-[var(--border-primary)] flex justify-end flex-shrink-0">
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
