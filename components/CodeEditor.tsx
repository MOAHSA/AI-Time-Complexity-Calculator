import React, { useRef, useEffect, useState, useMemo } from 'react';
import type { LineAnalysis, Language } from '../types';
// Import for side-effects to create window.Prism
import 'prismjs';

// Add Prism to the global window object for TypeScript
declare global {
  interface Window {
    Prism: typeof import('prismjs');
  }
}

interface CodeEditorProps {
  code: string;
  onCodeChange: (code: string) => void;
  analysisLines: LineAnalysis[];
  language: Language;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ code, onCodeChange, analysisLines, language }) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const preRef = useRef<HTMLPreElement | null>(null);
  const lineNumbersRef = useRef<HTMLDivElement | null>(null);
  
  const [activeLine, setActiveLine] = useState<number | null>(null);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({ display: 'none' });
  const [highlightedCode, setHighlightedCode] = useState('');

  const lines = code.split('\n');
  const lineCount = lines.length > 0 ? lines.length : 1;
  
  const analysisMap = useMemo(() => {
    const map = new Map<number, string>();
    if (analysisLines) {
      analysisLines.forEach(line => {
        if (line.analysis && !['Declaration', 'Comment', 'Empty line'].includes(line.analysis)) {
            map.set(line.lineNumber, line.analysis);
        }
      });
    }
    return map;
  }, [analysisLines]);

  useEffect(() => {
    const highlight = async () => {
      if (typeof window === 'undefined' || !window.Prism) {
        console.error("Prism.js is not available on the window object.");
        setHighlightedCode(code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'));
        return;
      }
      
      try {
        let langId: string;
        switch (language) {
          case 'python':
            await import('prismjs/components/prism-python');
            langId = 'python';
            break;
          case 'java':
            await import('prismjs/components/prism-java');
            langId = 'java';
            break;
          case 'cpp':
            await import('prismjs/components/prism-clike');
            await import('prismjs/components/prism-cpp');
            langId = 'cpp';
            break;
          default:
            langId = 'none';
        }

        if (window.Prism.languages[langId]) {
          const html = window.Prism.highlight(code, window.Prism.languages[langId], langId);
          setHighlightedCode(html);
        } else {
          if (langId !== 'none') {
            console.warn(`Prism grammar for '${langId}' not found after dynamic import.`);
          }
          setHighlightedCode(code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'));
        }
      } catch (error) {
        console.error("Failed to highlight code:", error);
        setHighlightedCode(code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'));
      }
    };
    highlight();
  }, [code, language]);


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

    if (top < paddingTop || top > lineNumbersRef.current.clientHeight - lineHeight) {
        setActiveLine(null);
        return;
    }

    setTooltipStyle({
        position: 'absolute',
        top: `${top}px`,
        left: `${lineNumbersRef.current.offsetWidth - 5}px`,
        transform: 'translateY(calc(-25% + 4px))',
        zIndex: 20,
        display: 'block'
    });
  };
  
  useEffect(() => {
    updateTooltipPosition();
  }, [activeLine, code, analysisLines]);

  const syncScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget;
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = target.scrollTop;
    }
    if (preRef.current) {
      preRef.current.scrollTop = target.scrollTop;
      preRef.current.scrollLeft = target.scrollLeft;
    }
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
        className="text-right text-gray-500 py-4 pl-4 pr-2 select-none overflow-y-hidden shrink-0"
        style={{
          lineHeight: 'var(--line-height, 1.5)'
        }}
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
            className="absolute inset-0 resize-none focus:outline-none w-full h-full overflow-auto code-editor-sync code-editor-textarea"
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
        />
        <pre 
            ref={preRef}
            aria-hidden="true" 
            className="absolute inset-0 w-full h-full overflow-auto pointer-events-none code-editor-sync"
        >
            <code 
                className={`language-${language}`}
                dangerouslySetInnerHTML={{ __html: highlightedCode }} 
            />
        </pre>
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