import React, { useState, useEffect, useRef, useCallback } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-python';
import type { AnalysisResult, Language } from '../types';

interface CodeEditorProps {
  code: string;
  onCodeChange: (newCode: string) => void;
  language: Language;
  analysisResult: AnalysisResult | null;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ code, onCodeChange, language, analysisResult }) => {
  const [highlightedCode, setHighlightedCode] = useState('');
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    const grammar = Prism.languages[language];
    if (grammar) {
      const finalCode = code.length > 0 ? code : ' '; // Prism needs non-empty string
      setHighlightedCode(Prism.highlight(finalCode, grammar, language));
    } else {
      setHighlightedCode(code); // Fallback for no grammar
    }
  }, [code, language]);

  const syncScroll = useCallback(() => {
    if (lineNumbersRef.current && textareaRef.current && preRef.current) {
      const top = textareaRef.current.scrollTop;
      const left = textareaRef.current.scrollLeft;
      lineNumbersRef.current.scrollTop = top;
      preRef.current.scrollTop = top;
      preRef.current.scrollLeft = left;
    }
  }, []);

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onCodeChange(e.target.value);
  };

  const lineCount = code.split('\n').length;

  return (
    <div className="flex w-full h-full font-mono text-sm border border-gray-700 rounded-b-lg overflow-hidden bg-gray-800 shadow-lg">
      <div
        ref={lineNumbersRef}
        className="line-numbers p-3 text-right bg-gray-900 text-gray-500 select-none overflow-y-hidden"
        style={{ lineHeight: '1.5rem' }}
      >
        {Array.from({ length: lineCount }, (_, i) => {
           const lineAnalysis = analysisResult?.lines.find(l => l.lineNumber === i + 1);
           const hasAnalysis = lineAnalysis && lineAnalysis.analysis && !['Comment', 'Empty line', 'Declaration'].includes(lineAnalysis.analysis);

          return (
            <div key={i} className="relative h-6 group flex items-center justify-end">
              <span className={`transition-opacity duration-200 ${hasAnalysis ? 'group-hover:opacity-30' : ''}`}>{i + 1}</span>
              {hasAnalysis && (
                 <div className="absolute right-full mr-2 px-2 py-1 bg-indigo-500 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-20 shadow-xl pointer-events-none">
                  {lineAnalysis.analysis}
                </div>
              )}
            </div>
          );
        })}
      </div>
       <div className="flex-grow relative overflow-hidden">
        <textarea
          ref={textareaRef}
          value={code}
          onChange={handleCodeChange}
          onScroll={syncScroll}
          className="code-editor-sync absolute inset-0 bg-transparent text-transparent resize-none focus:outline-none caret-indigo-400 z-10"
          spellCheck="false"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
        />
        <pre
          ref={preRef}
          aria-hidden="true"
          className="code-editor-sync absolute inset-0 text-gray-200 pointer-events-none"
        >
          <code className={`language-${language}`} dangerouslySetInnerHTML={{ __html: highlightedCode + '\n' }} />
        </pre>
      </div>
    </div>
  );
};

export default CodeEditor;
