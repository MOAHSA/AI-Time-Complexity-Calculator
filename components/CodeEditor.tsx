
import React, { useRef, useEffect } from 'react';
import type { LineAnalysis } from '../types';

interface CodeEditorProps {
  code: string;
  onCodeChange: (newCode: string) => void;
  analysisLines: LineAnalysis[];
}

const CodeEditor: React.FC<CodeEditorProps> = ({ code, onCodeChange, analysisLines }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const analysisRef = useRef<HTMLDivElement>(null);

  const lines = code.split('\n');
  const lineCount = lines.length > 0 ? lines.length : 1;

  const analysisMap = new Map<number, string>();
  analysisLines.forEach(line => {
    analysisMap.set(line.lineNumber, line.analysis);
  });

  const syncScroll = () => {
    if (textareaRef.current && lineNumbersRef.current && analysisRef.current) {
        const top = textareaRef.current.scrollTop;
        lineNumbersRef.current.scrollTop = top;
        analysisRef.current.scrollTop = top;
    }
  };

  useEffect(() => {
    syncScroll();
  }, [code, analysisLines]);

  return (
    <div className="flex-grow flex min-h-0 bg-gray-800/50 font-mono text-base relative border-y border-gray-700">
      <div
        ref={lineNumbersRef}
        className="text-right text-gray-500 py-4 pl-4 pr-2 select-none overflow-y-hidden"
        style={{ lineHeight: '1.5rem' }}
        aria-hidden="true"
      >
        {Array.from({ length: lineCount }, (_, i) => (
          <div key={i}>{i + 1}</div>
        ))}
      </div>
      
      <div className="relative flex-grow">
          <textarea
            ref={textareaRef}
            value={code}
            onChange={(e) => onCodeChange(e.target.value)}
            onScroll={syncScroll}
            className="absolute inset-0 p-4 bg-transparent text-gray-200 resize-none focus:outline-none w-full h-full leading-6"
            style={{
              fontFamily: 'inherit',
              tabSize: 4,
              MozTabSize: 4,
            }}
            spellCheck="false"
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
          />
      </div>

      <div 
        ref={analysisRef}
        className="analysis-pane text-left text-indigo-400/80 py-4 pl-2 pr-4 select-none overflow-y-hidden w-72 shrink-0 bg-gray-900/20"
        style={{ lineHeight: '1.5rem' }}
      >
        {Array.from({ length: lineCount }, (_, i) => (
            <div key={i} className="truncate" title={analysisMap.get(i + 1)}>
                {analysisMap.get(i + 1) || ''}
            </div>
        ))}
      </div>
    </div>
  );
};

export default CodeEditor;
