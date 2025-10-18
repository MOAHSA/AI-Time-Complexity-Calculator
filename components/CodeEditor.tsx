import React, { useRef, useEffect, LegacyRef, useState, useMemo } from 'react';
import type { LineAnalysis } from '../types';

interface CodeEditorProps {
  code: string;
  onCodeChange: (code: string) => void;
  analysisLines: LineAnalysis[];
}

const CodeEditor: React.FC<CodeEditorProps> = ({ code, onCodeChange, analysisLines }) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const lineNumbersRef = useRef<HTMLDivElement | null>(null);
  
  const [activeLine, setActiveLine] = useState<number | null>(null);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({ display: 'none' });

  const lines = code.split('\n');
  const lineCount = lines.length > 0 ? lines.length : 1;
  
  const analysisMap = useMemo(() => {
    const map = new Map<number, string>();
    if (analysisLines) {
      analysisLines.forEach(line => {
        // Only create entries for lines with meaningful analysis to show in a tooltip
        if (line.analysis && !['Declaration', 'Comment', 'Empty line'].includes(line.analysis)) {
            map.set(line.lineNumber, line.analysis);
        }
      });
    }
    return map;
  }, [analysisLines]);

  const handleLineClick = (lineNumber: number) => {
    if (analysisMap.has(lineNumber)) {
      setActiveLine(prev => (prev === lineNumber ? null : lineNumber));
    }
  };
  
  const updateTooltipPosition = () => {
    if (!activeLine || !textareaRef.current || !lineNumbersRef.current) {
        if (tooltipStyle.display !== 'none') setTooltipStyle({ display: 'none' });
        return;
    }
    
    const computedStyle = getComputedStyle(lineNumbersRef.current);
    const lineHeight = parseFloat(computedStyle.lineHeight);
    const paddingTop = parseFloat(computedStyle.paddingTop);
    const scrollTop = textareaRef.current.scrollTop;
    
    const top = (activeLine - 1) * lineHeight + paddingTop - scrollTop;

    // Hide tooltip if it's scrolled out of the visible area of the line numbers
    if (top < paddingTop || top > lineNumbersRef.current.clientHeight - lineHeight) {
        setActiveLine(null);
        return;
    }

    setTooltipStyle({
        position: 'absolute',
        top: `${top}px`,
        left: `${lineNumbersRef.current.offsetWidth - 5}px`, // Position next to line numbers
        transform: 'translateY(calc(-25% + 4px))',
        zIndex: 20,
        display: 'block'
    });
  };
  
  useEffect(() => {
    updateTooltipPosition();
  }, [activeLine, code, analysisLines]); // Recalculate when context changes

  const syncScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget;
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = target.scrollTop;
    }
    // Update position while scrolling
    if (activeLine) {
        updateTooltipPosition();
    }
  };
  
  const handleEditorInteraction = () => {
    if (activeLine) {
      setActiveLine(null);
    }
  };

  const activeAnalysis = activeLine ? analysisMap.get(activeLine) : null;

  return (
    <div 
        className="flex-grow flex min-h-0 bg-gray-800/50 text-base relative border-y border-gray-700"
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
        {Array.from({ length: lineCount }, (_, i) => {
            const lineNumber = i + 1;
            const hasAnalysis = analysisMap.has(lineNumber);
            return (
                <button
                    key={i}
                    onClick={() => handleLineClick(lineNumber)}
                    className={`block w-full text-right focus:outline-none rounded-sm ${hasAnalysis ? 'cursor-pointer hover:text-indigo-400' : 'cursor-default'}`}
                    disabled={!hasAnalysis}
                >
                    {lineNumber}
                </button>
            )
        })}
      </div>
      <div className="flex-grow relative">
        <textarea
            ref={textareaRef}
            spellCheck="false"
            value={code}
            onChange={(e) => onCodeChange(e.target.value)}
            onScroll={syncScroll}
            onClick={handleEditorInteraction}
            onFocus={handleEditorInteraction}
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

      {activeAnalysis && (
        <div 
          style={tooltipStyle}
          className="p-2 px-3 rounded-md bg-gray-900 border border-indigo-500/50 shadow-lg w-max max-w-sm text-left text-indigo-300 font-mono whitespace-pre-wrap"
        >
          {activeAnalysis}
        </div>
      )}
    </div>
  );
};

export default CodeEditor;
