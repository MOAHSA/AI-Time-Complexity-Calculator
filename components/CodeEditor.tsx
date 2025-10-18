
import React, { useRef, useEffect, useState } from 'react';
import type { LineAnalysis } from '../types';

interface CodeEditorProps {
  code: string;
  onCodeChange: (newCode: string) => void;
  analysisLines: LineAnalysis[];
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ 
    code, 
    onCodeChange, 
    analysisLines,
    fontFamily,
    fontSize,
    lineHeight
}) => {
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const analysisRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const [lineCount, setLineCount] = useState(code.split('\n').length);

  useEffect(() => {
    setLineCount(code.split('\n').length);
  }, [code]);

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = e.currentTarget.scrollTop;
    }
    if (analysisRef.current) {
      analysisRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };
  
  const editorStyle = {
      fontFamily,
      fontSize: `${fontSize}px`,
      lineHeight,
  };

  return (
    <div className="flex-grow flex font-mono relative overflow-hidden bg-gray-800" style={editorStyle}>
      <div 
        ref={lineNumbersRef} 
        className="w-12 text-right text-gray-500 p-2 overflow-y-hidden select-none"
        aria-hidden="true"
      >
        {Array.from({ length: lineCount }, (_, i) => (
          <div key={i}>{i + 1}</div>
        ))}
      </div>
      <textarea
        ref={textAreaRef}
        value={code}
        onChange={(e) => onCodeChange(e.target.value)}
        onScroll={handleScroll}
        spellCheck="false"
        className="flex-grow bg-transparent text-gray-100 p-2 resize-none outline-none caret-indigo-400"
        style={editorStyle}
      />
      <div
        ref={analysisRef}
        className="w-64 text-left text-gray-400 p-2 overflow-y-hidden"
        aria-label="Line by line complexity analysis"
      >
        {Array.from({ length: lineCount }, (_, i) => {
           const lineAnalysis = analysisLines.find(l => l.lineNumber === i + 1);
           return (
             <div key={i} className="truncate" title={lineAnalysis?.analysis}>
               {lineAnalysis?.analysis || ''}
             </div>
           );
        })}
      </div>
    </div>
  );
};

export default CodeEditor;
