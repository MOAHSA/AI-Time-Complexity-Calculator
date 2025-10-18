
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
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const [lineCount, setLineCount] = useState(code.split('\n').length);
  const [activeLine, setActiveLine] = useState<number | null>(null);

  useEffect(() => {
    setLineCount(code.split('\n').length);
  }, [code]);

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };

  const handleLineNumberClick = (lineNumber: number) => {
    setActiveLine(current => (current === lineNumber ? null : lineNumber));
  };

  const handleEditorInteraction = () => {
    setActiveLine(null);
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
        className="w-16 text-right text-gray-500 p-2 overflow-y-hidden select-none"
        aria-hidden="true"
      >
        {Array.from({ length: lineCount }, (_, i) => {
           const lineNumber = i + 1;
           const lineAnalysis = analysisLines.find(l => l.lineNumber === lineNumber);
           const isActive = activeLine === lineNumber;
           return (
             <div key={i} className="relative">
                <span 
                  className="cursor-pointer hover:text-gray-300 transition-colors px-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLineNumberClick(lineNumber);
                  }}
                >
                    {lineNumber}
                </span>
                {isActive && lineAnalysis?.analysis && (
                    <div className="analysis-tooltip">
                        {lineAnalysis.analysis}
                    </div>
                )}
             </div>
           );
        })}
      </div>
      <textarea
        ref={textAreaRef}
        value={code}
        onChange={(e) => onCodeChange(e.target.value)}
        onScroll={handleScroll}
        onClick={handleEditorInteraction}
        onFocus={handleEditorInteraction}
        spellCheck="false"
        className="flex-grow bg-transparent text-gray-100 p-2 resize-none outline-none caret-indigo-400"
        style={editorStyle}
      />
    </div>
  );
};

export default CodeEditor;