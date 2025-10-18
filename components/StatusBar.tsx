
import React from 'react';

interface StatusBarProps {
  bigO: string | null;
  isLoading: boolean;
}

const StatusBar: React.FC<StatusBarProps> = ({ bigO, isLoading }) => {
  return (
    <div className="w-full bg-gray-900 border-t border-gray-700 px-4 py-2 flex items-center justify-between text-sm text-gray-400 rounded-b-lg">
      <div>
        {isLoading ? (
          <div className="flex items-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Analyzing...</span>
          </div>
        ) : (
          <span>Ready</span>
        )}
      </div>
      <div className="font-bold text-lg text-indigo-400">
        {bigO && bigO !== "Error" && <span>{bigO}</span>}
        {bigO === "Error" && <span className="text-red-500">Analysis Failed</span>}
      </div>
    </div>
  );
};

export default StatusBar;
