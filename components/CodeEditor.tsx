import React, { useMemo, useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import CodeMirror from '@uiw/react-codemirror';
import { Extension } from '@codemirror/state';
import { EditorView, Decoration, DecorationSet, ViewPlugin, ViewUpdate } from '@codemirror/view';
import { python } from '@codemirror/lang-python';
import { java from } from '@codemirror/lang-java';
import { cpp } from '@codemirror/lang-cpp';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';
import { solarizedLight } from '@uiw/codemirror-theme-solarized';
import { nord } from '@uiw/codemirror-theme-nord';
import { okaidia } from '@uiw/codemirror-theme-okaidia';

import type { LineAnalysis, ConcreteLanguage } from '../types';

interface CodeEditorProps {
  code: string;
  onCodeChange: (newCode: string) => void;
  analysisLines: LineAnalysis[];
  language: ConcreteLanguage | null;
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  theme: string;
}

const lineAnalysisHighlight = (analysisLines: LineAnalysis[]) => {
  return ViewPlugin.fromClass(
    class {
      decorations: DecorationSet;

      constructor(view: EditorView) {
        this.decorations = this.buildDecorations(view);
      }

      update(update: ViewUpdate) {
        if (update.docChanged || update.viewportChanged) {
          this.decorations = this.buildDecorations(update.view);
        }
      }

      buildDecorations(view: EditorView): DecorationSet {
        const builder: any[] = [];
        for (const line of analysisLines) {
          if (line.lineNumber > 0 && line.lineNumber <= view.state.doc.lines) {
            const lineInfo = view.state.doc.line(line.lineNumber);
            builder.push(
              Decoration.line({
                attributes: { class: 'cm-line-highlighted' },
              }).range(lineInfo.from)
            );
          }
        }
        return Decoration.set(builder, true);
      }
    },
    {
      decorations: v => v.decorations,
    }
  );
};

const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  onCodeChange,
  analysisLines,
  language,
  fontFamily,
  fontSize,
  lineHeight,
  theme,
}) => {
  const [tooltip, setTooltip] = useState<{ content: string; top: number; left: number; line: number, sticky: boolean } | null>(null);
  
  useEffect(() => {
    const closeTooltip = () => setTooltip(null);
    if (tooltip) {
      window.addEventListener('scroll', closeTooltip, true); // Close on scroll in any scrollable container
      window.addEventListener('click', closeTooltip);
    }
    return () => {
      window.removeEventListener('scroll', closeTooltip, true);
      window.removeEventListener('click', closeTooltip);
    };
  }, [tooltip]);


  const languageExtension = useMemo(() => {
    switch (language) {
      case 'python': return [python()];
      case 'java': return [java()];
      case 'cpp': return [cpp()];
      default: return [];
    }
  }, [language]);
  
  const selectedTheme: Extension = useMemo(() => {
      switch(theme) {
          case 'modern': return vscodeDark;
          case 'neon': return okaidia;
          case 'light': return solarizedLight;
          case 'ocean': return nord;
          default: return vscodeDark;
      }
  }, [theme]);

  const gutterEventHandlers = useMemo(() => EditorView.domEventHandlers({
    click: (event, view) => {
        const target = event.target as HTMLElement;
        const gutterElement = target.closest('.cm-gutterElement');
        if (gutterElement) {
            event.stopPropagation();
            const lineNo = view.state.doc.lineAt(view.posAtDOM(target)).number;

            if (tooltip && tooltip.line === lineNo && tooltip.sticky) {
                setTooltip(null);
                return;
            }

            const analysis = analysisLines.find(l => l.lineNumber === lineNo);
            if (analysis) {
                const rect = gutterElement.getBoundingClientRect();
                setTooltip({
                    content: analysis.analysis,
                    top: rect.top,
                    left: rect.right + 10,
                    line: lineNo,
                    sticky: true,
                });
            } else {
                setTooltip(null);
            }
        }
    },
    mouseover: (event, view) => {
        if (tooltip && tooltip.sticky) return; // Don't show hover tooltip if a sticky one is active
        const target = event.target as HTMLElement;
        const gutterElement = target.closest('.cm-gutterElement');
        if (gutterElement) {
            const lineNo = view.state.doc.lineAt(view.posAtDOM(target)).number;
            const analysis = analysisLines.find(l => l.lineNumber === lineNo);
            if (analysis) {
                const rect = gutterElement.getBoundingClientRect();
                setTooltip({
                    content: analysis.analysis,
                    top: rect.top,
                    left: rect.right + 10,
                    line: lineNo,
                    sticky: false,
                });
            }
        }
    },
    mouseout: () => {
        if (tooltip && !tooltip.sticky) {
            setTooltip(null); // Hide hover tooltips
        }
    }
  }), [analysisLines, tooltip]);

  const extensions = useMemo(() => {
    const exts: Extension[] = [
        ...languageExtension,
        gutterEventHandlers,
        EditorView.lineWrapping,
    ];
    if (analysisLines.length > 0) {
      exts.push(lineAnalysisHighlight(analysisLines));
    }
    return exts;
  }, [analysisLines, languageExtension, gutterEventHandlers]);

  return (
    <div className="flex-grow h-full overflow-auto relative code-editor-wrapper">
      {tooltip && ReactDOM.createPortal(
        <div 
            className="analysis-tooltip" 
            style={{ top: `${tooltip.top}px`, left: `${tooltip.left}px` }}
            onClick={e => e.stopPropagation()}
        >
            {tooltip.content}
        </div>,
        document.body
      )}
      <CodeMirror
        value={code}
        onChange={onCodeChange}
        height="100%"
        width="100%"
        style={{
          fontFamily,
          fontSize: `${fontSize}px`,
          lineHeight: `${lineHeight}`,
        }}
        extensions={extensions}
        theme={selectedTheme}
        basicSetup={{
          lineNumbers: true,
          foldGutter: true,
          highlightActiveLine: true,
          highlightActiveLineGutter: true,
          autocompletion: true,
          bracketMatching: true,
        }}
      />
    </div>
  );
};

export default CodeEditor;