
import React, { useState, useRef, useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { java from '@codemirror/lang-java';
import { cpp } from '@codemirror/lang-cpp';
import { EditorView } from '@codemirror/view';
import type { OptimizationHistoryItem, ChatMessage, OptimizationResource, ConcreteLanguage } from '../types';

interface OptimizationModalProps {
  historyItem: OptimizationHistoryItem;
  onSendMessage: (message: string) => void;
  isChatLoading: boolean;
  onClose: () => void;
}

const getLanguageExtension = (language: ConcreteLanguage) => {
    switch (language) {
      case 'python': return python();
      case 'java': return java();
      case 'cpp': return cpp();
      default: return python();
    }
};

const ResourceLink: React.FC<{ resource: OptimizationResource }> = ({ resource }) => (
    <a href={resource.url} target="_blank" rel="noopener noreferrer" className="block p-3 bg-[var(--bg-tertiary)] hover:bg-[var(--bg-quaternary)] rounded-md transition-colors">
        <p className="font-semibold text-[var(--text-primary)]">{resource.title}</p>
        <span className="text-xs text-[var(--text-tertiary)] uppercase">{resource.type}</span>
    </a>
);

const ChatBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
    const isUser = message.role === 'user';
    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xl p-3 rounded-lg ${isUser ? 'bg-[var(--bg-interactive)] text-[var(--text-on-interactive)]' : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'}`}>
                <p style={{ whiteSpace: 'pre-wrap' }}>{message.content}</p>
            </div>
        </div>
    )
};


const OptimizationModal: React.FC<OptimizationModalProps> = ({ 
    historyItem, 
    onSendMessage, 
    isChatLoading,
    onClose 
}) => {
    const [message, setMessage] = useState('');
    const chatContainerRef = useRef<HTMLDivElement>(null);

    const languageExtension = getLanguageExtension(historyItem.language);
    const readOnlyTheme = EditorView.theme({
        '&': {
            backgroundColor: 'var(--bg-tertiary)',
            fontFamily: `'Fira Code', monospace`,
            fontSize: '14px',
        },
        '.cm-content': { color: 'var(--text-secondary)'},
        '.cm-gutters': {
            backgroundColor: 'var(--bg-quaternary)',
            color: 'var(--text-tertiary)',
            border: 'none'
        },
    }, { dark: true });

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [historyItem.chatHistory]);

    const handleSend = () => {
        if (message.trim() && !isChatLoading) {
            onSendMessage(message);
            setMessage('');
        }
    };
    
  return (
    <div 
        className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
    >
      <div 
        className="bg-[var(--bg-secondary)] rounded-lg shadow-xl w-full max-w-4xl h-[90vh] m-4 flex flex-col"
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-[var(--border-primary)] flex justify-between items-center flex-shrink-0">
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">Optimization Details</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="flex-grow flex overflow-hidden">
            {/* Left side: Original Code and Suggestion */}
            <div className="w-1/2 p-4 flex flex-col border-r border-[var(--border-primary)] overflow-y-auto">
                <div>
                    <h3 className="text-sm font-medium text-[var(--text-tertiary)] mb-2">Original Code</h3>
                    <div className="rounded-md overflow-hidden border border-[var(--border-secondary)]">
                        <CodeMirror
                            value={historyItem.originalCode}
                            extensions={[languageExtension, readOnlyTheme, EditorView.lineWrapping]}
                            readOnly={true}
                        />
                    </div>
                </div>
                <div className="mt-4">
                    <h3 className="text-sm font-medium text-[var(--text-tertiary)] mb-2">Suggestion</h3>
                    <div className="p-4 bg-[var(--bg-tertiary)] rounded-md text-[var(--text-secondary)]" style={{ whiteSpace: 'pre-wrap' }}>
                        {historyItem.result.suggestion}
                    </div>
                </div>
                {historyItem.result.resources.length > 0 && (
                    <div className="mt-4">
                        <h3 className="text-sm font-medium text-[var(--text-tertiary)] mb-2">Resources</h3>
                        <div className="space-y-2">
                            {historyItem.result.resources.map(res => <ResourceLink key={res.url} resource={res} />)}
                        </div>
                    </div>
                )}
            </div>

            {/* Right side: Chat */}
            <div className="w-1/2 p-4 flex flex-col">
                <h3 className="text-sm font-medium text-[var(--text-tertiary)] mb-2 flex-shrink-0">Discuss with AI</h3>
                <div ref={chatContainerRef} className="flex-grow space-y-4 overflow-y-auto pr-2">
                    {historyItem.chatHistory.map((msg, index) => <ChatBubble key={index} message={msg} />)}
                    {isChatLoading && <ChatBubble message={{role: 'model', content: 'Thinking...'}} />}
                </div>
                <div className="mt-4 flex space-x-2 flex-shrink-0">
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Ask a follow-up question..."
                        className="flex-grow bg-[var(--bg-tertiary)] border border-[var(--border-secondary)] rounded-md p-2 text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--ring-color)] focus:border-[var(--ring-color)]"
                        disabled={isChatLoading}
                    />
                    <button onClick={handleSend} disabled={isChatLoading || !message.trim()} className="bg-[var(--bg-interactive)] hover:bg-[var(--bg-interactive-hover)] disabled:bg-[var(--bg-interactive-disabled)] disabled:cursor-not-allowed text-[var(--text-on-interactive)] font-semibold py-2 px-4 rounded-md">
                        Send
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default OptimizationModal;
