
import React, { memo } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { EditorView } from '@codemirror/view';
import { python } from '@codemirror/lang-python';
import { java from '@codemirror/lang-java';
import { cpp } from '@codemirror/lang-cpp';
import { Extension } from '@codemirror/state';
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

const getLanguageExtension = (language: ConcreteLanguage | null): Extension[] => {
  switch (language) {
    case 'python':
      return [python()];
    case 'java':
      return [java()];
    case 'cpp':
      return [cpp()];
    default:
      return [python()]; // Defaulting to python for 'auto' before detection
  }
};

const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  onCodeChange,
  analysisLines,
  language,
  fontFamily,
  fontSize,
  lineHeight,
}) => {
  const extensions = React.useMemo(() => getLanguageExtension(language), [language]);

  const theme = EditorView.theme({
    '&': {
      color: 'var(--text-primary)',
      backgroundColor: 'var(--bg-primary)',
      fontFamily: fontFamily,
      fontSize: `${fontSize}px`,
      height: '100%',
    },
    '.cm-content': {
      caretColor: 'var(--text-interactive)',
      lineHeight: `${lineHeight}`,
    },
    '&.cm-focused .cm-cursor': {
      borderLeftColor: 'var(--text-interactive)',
    },
    '&.cm-focused .cm-selectionBackground, ::selection': {
      backgroundColor: 'var(--bg-selection) !important',
    },
    '.cm-gutters': {
      backgroundColor: 'var(--bg-secondary)',
      color: 'var(--text-tertiary)',
      border: 'none',
      cursor: 'help',
    },
    '.cm-activeLineGutter': {
        backgroundColor: 'var(--bg-tertiary)',
    },
  }, {dark: true});

  // Use simple browser tooltips on line numbers for analysis.
  const lineHoverTooltips = EditorView.domEventHandlers({
    mousemove(event, view) {
        const target = event.target as HTMLElement;
        if (target.classList.contains('cm-gutterElement')) {
            const lineNo = parseInt(target.innerText, 10);
            if (!isNaN(lineNo)) {
              const analysis = analysisLines.find(l => l.lineNumber === lineNo);
              target.title = analysis ? analysis.analysis : '';
            }
        }
    }
  });

  return (
    <div className="flex-grow h-full relative">
      <CodeMirror
        value={code}
        height="100%"
        extensions={[...extensions, theme, EditorView.lineWrapping, lineHoverTooltips]}
        onChange={onCodeChange}
      />
    </div>
  );
};

export default memo(CodeEditor);
