import React, { useState, useRef, useEffect } from 'react';
import type { OptimizationHistoryItem, ChatMessage, OptimizationResource } from '../types';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import rehypeRaw from 'rehype-raw';

interface OptimizationModalProps {
  item: OptimizationHistoryItem;
  onClose: () => void;
  onContinueChat: (message: string) => void;
}

const ResourceLink: React.FC<{ resource: OptimizationResource }> = ({ resource }) => {
    // Icons for different resource types
    const icons = {
        article: '📄',
        video: '🎬',
        github: '💻',
        documentation: '📚',
        other: '🔗',
    };
    return (
        <a 
            href={resource.url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center space-x-2 bg-[var(--bg-tertiary)] hover:bg-[var(--bg-quaternary)] p-2 rounded-md transition-colors"
        >
            <span className="text-lg">{icons[resource.type] || '🔗'}</span>
            <span className="text-[var(--text-secondary)] font-medium truncate" title={resource.title}>{resource.title}</span>
        </a>
    );
};

const LoadingBubble: React.FC = () => (
    <div className="flex w-full justify-start">
        <div className="max-w-xl lg:max-w-2xl px-4 py-3 rounded-lg bg-[var(--bg-tertiary)] text-[var(--text-secondary)]">
            <div className="flex items-center space-x-1 loading-dots">
                <span className="h-2 w-2 bg-current rounded-full"></span>
                <span className="h-2 w-2 bg-current rounded-full"></span>
                <span className="h-2 w-2 bg-current rounded-full"></span>
            </div>
        </div>
    </div>
);

const ChatBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
    if (message.role === 'loading') {
        return <LoadingBubble />;
    }

    const isUser = message.role === 'user';
    return (
        <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xl lg:max-w-2xl px-4 py-2 rounded-lg prose prose-invert prose-sm ${isUser ? 'bg-[var(--bg-interactive)] text-[var(--text-on-interactive)]' : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'}`}>
                <ReactMarkdown
                    rehypePlugins={[rehypeRaw]}
                    components={{
                        code({ node, inline, className, children, ...props }) {
                            const match = /language-(\w+)/.exec(className || '');
                            return !inline && match ? (
                                <SyntaxHighlighter
                                    style={vscDarkPlus}
                                    language={match[1]}
                                    PreTag="div"
                                    {...props}
                                >
                                    {String(children).replace(/\n$/, '')}
                                </SyntaxHighlighter>
                            ) : (
                                <code className={className} {...props}>
                                    {children}
                                </code>
                            );
                        },
                    }}
                >
                    {message.content}
                </ReactMarkdown>
            </div>
        </div>
    )
};


const OptimizationModal: React.FC<OptimizationModalProps> = ({ item, onClose, onContinueChat }) => {
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [item.chatHistory]);

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatInput.trim()) {
        onContinueChat(chatInput.trim());
        setChatInput('');
    }
  };

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-[var(--bg-secondary)] rounded-lg shadow-xl w-full max-w-4xl m-4 flex flex-col h-[90vh]"
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-[var(--border-primary)] flex justify-between items-center flex-shrink-0">
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">Optimization Suggestion</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--bg-secondary)] focus:ring-[var(--ring-color)]"
            aria-label="Close optimization details"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-6 space-y-6">
            <div className="prose prose-invert max-w-none text-[var(--text-secondary)]">
                <ReactMarkdown
                    rehypePlugins={[rehypeRaw]}
                    components={{
                        code({ node, inline, className, children, ...props }) {
                            const match = /language-(\w+)/.exec(className || '');
                            return !inline && match ? (
                                <SyntaxHighlighter
                                    style={vscDarkPlus}
                                    language={match[1]}
                                    PreTag="div"
                                    {...props}
                                >
                                    {String(children).replace(/\n$/, '')}
                                </SyntaxHighlighter>
                            ) : (
                                <code className={`${className || ''} bg-[var(--bg-tertiary)] text-[var(--text-primary)] px-1 py-0.5 rounded-sm`} {...props}>
                                    {children}
                                </code>
                            );
                        },
                    }}
                >
                    {item.result.suggestion}
                </ReactMarkdown>
            </div>

            {item.result.resources && item.result.resources.length > 0 && (
                <div>
                    <h3 className="text-lg font-semibold mb-2 text-[var(--text-primary)]">Learning Resources</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {item.result.resources.map(res => <ResourceLink key={res.url} resource={res} />)}
                    </div>
                </div>
            )}
            
            {(item.chatHistory.length > 0) && <div className="border-t border-[var(--border-primary)]/50 pt-4"></div>}

            <div className="space-y-4">
                {item.chatHistory.map((msg, index) => <ChatBubble key={index} message={msg} />)}
                 <div ref={chatEndRef} />
            </div>

        </div>

        <div className="p-4 border-t border-[var(--border-primary)] flex-shrink-0">
          <form onSubmit={handleChatSubmit} className="flex space-x-2">
            <input
              type="text"
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              placeholder="Ask a follow-up question..."
              className="flex-grow bg-[var(--bg-tertiary)] border border-[var(--border-secondary)] rounded-md p-2 text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--ring-color)] focus:border-[var(--ring-color)]"
              aria-label="Chat input"
            />
            <button
              type="submit"
              className="bg-[var(--bg-interactive)] hover:bg-[var(--bg-interactive-hover)] disabled:bg-[var(--bg-interactive-disabled)] text-[var(--text-on-interactive)] font-semibold py-2 px-4 rounded-md transition-colors"
              disabled={!chatInput.trim()}
              aria-label="Send message"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OptimizationModal;