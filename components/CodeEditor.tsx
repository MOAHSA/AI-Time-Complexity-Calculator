import React, { useMemo } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { Extension } from '@codemirror/state';
import { EditorView, Decoration, DecorationSet, ViewPlugin, ViewUpdate } from '@codemirror/view';
import { python } from '@codemirror/lang-python';
// FIX: The `java` export from `@codemirror/lang-java` conflicts with the reserved keyword `java`.
// It's aliased to `javaLang` to avoid this conflict.
import { java as javaLang } from '@codemirror/lang-java';
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
  fontLigatures: boolean;
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
  fontLigatures,
}) => {
  const languageExtension = useMemo(() => {
    switch (language) {
      case 'python': return [python()];
      // FIX: Use the aliased `javaLang` import.
      case 'java': return [javaLang()];
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

  const extensions = useMemo(() => {
    const exts: Extension[] = [
        ...languageExtension,
        EditorView.lineWrapping,
    ];
    if (analysisLines.length > 0) {
      exts.push(lineAnalysisHighlight(analysisLines));
    }
    return exts;
  }, [analysisLines, languageExtension]);

  return (
    <div className="flex-grow h-full overflow-auto relative code-editor-wrapper">
      <CodeMirror
        value={code}
        onChange={onCodeChange}
        height="100%"
        width="100%"
        style={{
          fontFamily,
          fontSize: `${fontSize}px`,
          lineHeight: `${lineHeight}`,
          fontVariantLigatures: fontLigatures ? 'common-ligatures' : 'none',
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