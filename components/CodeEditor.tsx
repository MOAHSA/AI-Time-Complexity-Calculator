
import React, { useRef, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import type { LineAnalysis } from '../types';

interface CodeEditorProps {
  code: string;
  onCodeChange: (newCode: string) => void;
  analysisLines: LineAnalysis[];
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
}

interface TooltipState {
  visible: boolean;
  content: string;
  top: number;
  left: number;
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
  const [tooltip, setTooltip] = useState<TooltipState>({ visible: false, content: '', top: 0, left: 0 });

  useEffect(() => {
    setLineCount(code.split('\n').length);
  }, [code]);
  
  // Hide tooltip if analysis results change
  useEffect(() => {
    setTooltip(t => ({...t, visible: false}));
    setActiveLine(null);
  }, [analysisLines]);


  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };

  const handleLineNumberClick = (lineNumber: number, target: HTMLElement) => {
    // If clicking the same active line, hide the tooltip
    if (activeLine === lineNumber) {
      setActiveLine(null);
      setTooltip({ ...tooltip, visible: false });
      return;
    }
    
    const lineAnalysis = analysisLines.find(l => l.lineNumber === lineNumber);
    if (lineAnalysis?.analysis && lineAnalysis.analysis.trim()) {
      const rect = target.getBoundingClientRect();
      setActiveLine(lineNumber);
      setTooltip({
        visible: true,
        content: lineAnalysis.analysis,
        top: rect.top + rect.height / 2, // Vertically center on the line number
        left: rect.right + 10, // 10px to the right
      });
    } else {
      setActiveLine(null);
      setTooltip({ ...tooltip, visible: false });
    }
  };

  const handleEditorInteraction = () => {
    setActiveLine(null);
    setTooltip({ ...tooltip, visible: false });
  };
  
  const editorStyle = {
      fontFamily,
      fontSize: `${fontSize}px`,
      lineHeight,
  };

  return (
    <>
      <div className="flex-grow flex font-mono relative overflow-hidden bg-[var(--bg-secondary)]" style={editorStyle}>
        <div 
          ref={lineNumbersRef} 
          className="w-16 text-right text-[var(--text-tertiary)] p-2 overflow-y-hidden select-none"
          aria-hidden="true"
        >
          {Array.from({ length: lineCount }, (_, i) => {
            const lineNumber = i + 1;
            const hasAnalysis = analysisLines.some(l => l.lineNumber === lineNumber && l.analysis.trim());
            const lineClasses = [
              hasAnalysis ? 'cursor-pointer hover:text-[var(--text-primary)] transition-colors' : 'cursor-default',
              activeLine === lineNumber ? 'text-[var(--text-primary)] font-bold' : '',
              'px-2'
            ].join(' ');

            return (
              <div key={i} className="relative">
                  <span 
                    className={lineClasses}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (hasAnalysis) {
                        handleLineNumberClick(lineNumber, e.currentTarget);
                      }
                    }}
                  >
                      {lineNumber}
                  </span>
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
          onKeyDown={handleEditorInteraction}
          spellCheck="false"
          className="code-editor-textarea flex-grow bg-transparent text-[var(--text-primary)] p-2 resize-none outline-none"
          style={editorStyle}
        />
      </div>
      {tooltip.visible && ReactDOM.createPortal(
        <div 
          className="analysis-tooltip-portal"
          style={{ top: `${tooltip.top}px`, left: `${tooltip.left}px` }}
        >
          {tooltip.content}
        </div>,
        document.body
      )}
    </>
  );
};

export default CodeEditor;
