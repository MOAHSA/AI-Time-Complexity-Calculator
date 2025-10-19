import React, { useRef, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import Prism from 'prismjs';
// Import language definitions for Prism to register them.
// IMPORTANT: The import order matters due to dependencies.
// C, C++, and Java all depend on 'clike'. C++ also depends on 'c'.
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-python';

import type { LineAnalysis, ConcreteLanguage } from '../types';

interface CodeEditorProps {
  code: string;
  onCodeChange: (newCode: string) => void;
  analysisLines: LineAnalysis[];
  language: ConcreteLanguage | null;
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
    language,
    fontFamily,
    fontSize,
    lineHeight
}) => {
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);

  const [lineCount, setLineCount] = useState(code.split('\n').length);
  const [activeLine, setActiveLine] = useState<number | null>(null);
  const [tooltip, setTooltip] = useState<TooltipState>({ visible: false, content: '', top: 0, left: 0 });
  const [highlightedCode, setHighlightedCode] = useState<string>('');
  
  // Update line count when code changes
  useEffect(() => {
    setLineCount(code.split('\n').length);
  }, [code]);
  
  // Trigger syntax highlighting when code or language changes
  useEffect(() => {
    if (language && Prism.languages[language]) {
      const html = Prism.highlight(code, Prism.languages[language], language);
      setHighlightedCode(html);
    } else {
      // If no language, just escape the text to prevent rendering as HTML
      const escaped = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      setHighlightedCode(escaped);
    }
  }, [code, language]);

  // Hide tooltip if analysis results change
  useEffect(() => {
    setTooltip(t => ({...t, visible: false}));
    setActiveLine(null);
  }, [analysisLines]);


  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    const { scrollTop, scrollLeft } = e.currentTarget;
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = scrollTop;
    }
    if (preRef.current) {
        preRef.current.scrollTop = scrollTop;
        preRef.current.scrollLeft = scrollLeft;
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
      tabSize: 4,
      MozTabSize: 4,
  };

  return (
    <>
      <div className="flex-grow flex font-mono relative overflow-hidden bg-[var(--bg-secondary)]">
        <div 
          ref={lineNumbersRef} 
          className="w-16 text-right text-[var(--text-tertiary)] p-2 overflow-y-hidden select-none flex-shrink-0"
          style={editorStyle}
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
              <div key={i} className="relative h-full">
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
        <div className="flex-grow relative">
            <textarea
                ref={textAreaRef}
                value={code}
                onChange={(e) => onCodeChange(e.target.value)}
                onScroll={handleScroll}
                onClick={handleEditorInteraction}
                onFocus={handleEditorInteraction}
                onKeyDown={handleEditorInteraction}
                spellCheck="false"
                className="code-editor-textarea absolute inset-0 z-10 p-2 w-full h-full resize-none outline-none overflow-auto whitespace-pre-wrap break-words"
                style={editorStyle}
            />
            <pre
                ref={preRef}
                className="absolute inset-0 z-0 p-2 w-full h-full pointer-events-none overflow-auto whitespace-pre-wrap break-words"
                style={editorStyle}
                aria-hidden="true"
            >
                <code
                    className={`language-${language || 'text'}`}
                    dangerouslySetInnerHTML={{ __html: highlightedCode + '\n' }}
                />
            </pre>
        </div>
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