
import React, { useRef, useEffect, LegacyRef } from 'react';
import type { LineAnalysis } from '../types';

interface CodeEditorProps {
  code: string;
  onCodeChange: (code: string) => void;
  analysisLines: LineAnalysis[];
}

const CodeEditor: React.FC<CodeEditorProps> = ({ code, onCodeChange, analysisLines }) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const lineNumbersRef: LegacyRef<HTMLDivElement> = useRef(null);
  const analysisRef: LegacyRef<HTMLDivElement> = useRef(null);

  const lines = code.split('\n');
  const lineCount = lines.length > 0 ? lines.length : 1;
  
  const analysisMap = new Map<number, string>();
  if (analysisLines) {
    analysisLines.forEach(line => {
      analysisMap.set(line.lineNumber, line.analysis);
    });
  }

  const syncScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget;
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = target.scrollTop;
    }
    if (analysisRef.current) {
      analysisRef.current.scrollTop = target.scrollTop;
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      const target = textareaRef.current;
      if (lineNumbersRef.current) {
        lineNumbersRef.current.scrollTop = target.scrollTop;
      }
      if (analysisRef.current) {
        analysisRef.current.scrollTop = target.scrollTop;
      }
    }
  }, [code, analysisLines]);

  return (
    <div className="flex-grow flex min-h-0 bg-gray-800/50 text-base relative border-y border-gray-700"
         style={{
             fontFamily: 'var(--font-family, monospace)',
             fontSize: 'var(--font-size, 16px)',
             lineHeight: 'var(--line-height, 1.5)',
         }}
    >
      <div
        ref={lineNumbersRef}
        className="text-right text-gray-500 py-4 pl-4 pr-2 select-none overflow-y-hidden"
        
        aria-hidden="true"
      >
        {Array.from({ length: lineCount }, (_, i) => (
          <div key={i}>{i + 1}</div>
        ))}
      </div>
      <div className="flex-grow relative">
        <textarea
            ref={textareaRef}
            spellCheck="false"
            value={code}
            onChange={(e) => onCodeChange(e.target.value)}
            onScroll={syncScroll}
            className="absolute inset-0 p-4 bg-transparent text-gray-200 resize-none focus:outline-none w-full h-full"
            style={{
              fontFamily: 'var(--font-family, monospace)',
              tabSize: 4,
              MozTabSize: 4,
            }}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
        />
      </div>

      <div 
        ref={analysisRef}
        className="analysis-pane text-left text-indigo-400/80 py-4 pl-2 pr-4 select-none overflow-y-hidden w-72 shrink-0 bg-gray-900/20" 
        
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
