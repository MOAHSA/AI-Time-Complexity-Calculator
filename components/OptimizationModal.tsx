import React, { useState, useRef, useEffect } from 'react';
import type { OptimizationHistoryItem, OptimizationResource, ChatMessage } from '../types';

interface OptimizationModalProps {
  historyItem: OptimizationHistoryItem | null;
  onSendMessage: (message: string) => void;
  isChatLoading: boolean;
  onClose: () => void;
}

const LinkIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 flex-shrink-0 text-[var(--text-tertiary)] group-hover:text-[var(--ring-color)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
  </svg>
);

const YouTubeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 flex-shrink-0 text-[var(--text-tertiary)] group-hover:text-[var(--ring-color)]" fill="currentColor" viewBox="0 0 24 24">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const GitHubIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 flex-shrink-0 text-[var(--text-tertiary)] group-hover:text-[var(--ring-color)]" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
    </svg>
);


const ResourceIcon: React.FC<{ type: OptimizationResource['type'] }> = ({ type }) => {
    switch (type) {
        case 'video': return <YouTubeIcon />;
        case 'github': return <GitHubIcon />;
        default: return <LinkIcon />;
    }
};

const ChatBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
  const bubbleClass = message.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-model';
  return (
    <div className={`chat-bubble ${bubbleClass}`}>
      {message.content}
    </div>
  );
};


const OptimizationModal: React.FC<OptimizationModalProps> = ({ historyItem, onSendMessage, isChatLoading, onClose }) => {
  const [userInput, setUserInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [historyItem?.chatHistory, isChatLoading]);

  if (!historyItem) return null;
  const { result, chatHistory } = historyItem;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userInput.trim() && !isChatLoading) {
      onSendMessage(userInput.trim());
      setUserInput('');
    }
  };

  const renderSuggestion = () => {
    const parts = result.suggestion.split(/```(?:\w+\n)?([\s\S]*?)```/);
    return parts.map((part, index) => {
        if (index % 2 === 1) { 
            return (
                <pre key={index} className="bg-[var(--bg-primary)] rounded-md p-4 my-4 overflow-x-auto">
                    <code className="text-sm font-mono text-[var(--text-primary)]">{part.trim()}</code>
                </pre>
            );
        }
        return <p key={index} className="text-[var(--text-secondary)] whitespace-pre-wrap">{part}</p>;
    });
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="bg-[var(--bg-secondary)] rounded-lg shadow-xl w-full max-w-3xl m-4 flex flex-col max-h-[90vh]"
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-[var(--border-primary)] flex justify-between items-center flex-shrink-0">
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">
            {result.optimized ? 'Analysis Complete' : 'Optimization Suggestion'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--bg-secondary)] focus:ring-[var(--ring-color)]"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div ref={scrollRef} className="p-6 overflow-y-auto flex-grow">
          {renderSuggestion()}

          {result.resources?.length > 0 && (
            <div className="mt-6 pt-4 border-t border-[var(--border-primary)]">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3">Recommended Resources</h3>
              <ul className="space-y-2">
                {result.resources.map((resource, index) => (
                  <li key={index}>
                    <a href={resource.url} target="_blank" rel="noopener noreferrer" className="flex items-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:underline transition-colors group">
                      <ResourceIcon type={resource.type} />
                      <span>{resource.title}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          { (chatHistory?.length > 0 || result.resources?.length > 0) && (
             <div className="mt-6 pt-4 border-t border-[var(--border-primary)]">
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3">Follow-up Chat</h3>
                <div className="flex flex-col space-y-4">
                  {chatHistory.map((msg, index) => <ChatBubble key={index} message={msg} />)}
                  {isChatLoading && <ChatBubble message={{role: 'model', content: 'Thinking...'}} />}
                </div>
             </div>
          )}
        </div>
        
        <div className="p-4 bg-[var(--bg-secondary)] border-t border-[var(--border-primary)] flex-shrink-0">
            <form onSubmit={handleSubmit} className="flex items-center space-x-2">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Ask a follow-up question..."
                className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-secondary)] rounded-md p-2 text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--ring-color)] focus:border-[var(--ring-color)] outline-none"
                disabled={isChatLoading}
              />
              <button
                type="submit"
                className="bg-[var(--bg-interactive)] hover:bg-[var(--bg-interactive-hover)] disabled:bg-[var(--bg-interactive-disabled)] text-[var(--text-on-interactive)] font-semibold py-2 px-4 rounded-md transition-colors"
                disabled={isChatLoading || !userInput.trim()}
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
