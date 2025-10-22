import React from 'react';
import type { Language, ModelPreference } from '../types';

interface SettingsModalProps {
  currentLanguage: Language;
  onLanguageChange: (language: Language) => void;
  currentTheme: string;
  onThemeChange: (theme: string) => void;
  fontFamily: string;
  onFontFamilyChange: (font: string) => void;
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  lineHeight: number;
  onLineHeightChange: (height: number) => void;
  fontLigatures: boolean;
  onFontLigaturesChange: (enabled: boolean) => void;
  modelPreference: ModelPreference;
  onModelPreferenceChange: (preference: ModelPreference) => void;
  onReset: () => void;
  onClose: () => void;
}

const languageOptions: { id: Language; name: string }[] = [
  { id: 'auto', name: 'Auto' },
  { id: 'python', name: 'Python' },
  { id: 'java', name: 'Java' },
  { id: 'cpp', name: 'C++' },
  { id: 'pseudocode', name: 'Pseudocode' },
];

const themeOptions: { id: string; name: string }[] = [
    { id: 'modern', name: 'Modern' },
    { id: 'neon', name: 'Neon' },
    { id: 'light', name: 'Light' },
    { id: 'ocean', name: 'Ocean' },
];

const fontOptions = [
  { id: `'Fira Code', monospace`, name: 'Fira Code' },
  { id: `'Source Code Pro', monospace`, name: 'Source Code Pro' },
  { id: `'Roboto Mono', monospace`, name: 'Roboto Mono' },
  { id: `'JetBrains Mono', monospace`, name: 'JetBrains Mono' },
  { id: `monospace`, name: 'Monospace' },
];

const modelOptions: { id: ModelPreference; name: string }[] = [
    { id: 'quality', name: 'Quality' },
    { id: 'speed', name: 'Speed' },
];

const SettingsModal: React.FC<SettingsModalProps> = ({ 
  currentLanguage, onLanguageChange, 
  currentTheme, onThemeChange,
  fontFamily, onFontFamilyChange,
  fontSize, onFontSizeChange,
  lineHeight, onLineHeightChange,
  fontLigatures, onFontLigaturesChange,
  modelPreference, onModelPreferenceChange,
  onReset, onClose 
}) => {
  return (
    <div 
      className="modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="bg-[var(--bg-secondary)] rounded-lg shadow-xl w-full max-w-md m-4 flex flex-col max-h-[90vh]"
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-[var(--border-primary)] flex justify-between items-center flex-shrink-0">
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">Settings</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--bg-secondary)] focus:ring-[var(--ring-color)]"
            aria-label="Close settings"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6 space-y-4 overflow-y-auto">
          {/* Theme Section */}
          <div className="settings-section">
            <h3 className="text-lg font-medium text-[var(--text-primary)] mb-3">Theme</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {themeOptions.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => onThemeChange(theme.id)}
                  className={`w-full p-3 rounded-md text-center font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--bg-secondary)] focus:ring-[var(--ring-color)] ${
                    currentTheme === theme.id
                      ? 'bg-[var(--bg-interactive)] text-[var(--text-on-interactive)]'
                      : 'bg-[var(--bg-tertiary)] hover:bg-[var(--bg-quaternary)] text-[var(--text-secondary)]'
                  }`}
                >
                  {theme.name}
                </button>
              ))}
            </div>
          </div>

          {/* Editor Section */}
          <div className="settings-section">
            <h3 className="text-lg font-medium text-[var(--text-primary)] mb-3">Editor</h3>
            <div className="space-y-4">
               <div>
                 <label htmlFor="language-select" className="block text-sm text-[var(--text-tertiary)] mb-1">Language</label>
                  <select
                   id="language-select"
                   value={currentLanguage}
                   onChange={(e) => onLanguageChange(e.target.value as Language)}
                   className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-secondary)] rounded-md p-2 text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--ring-color)] focus:border-[var(--ring-color)]"
                 >
                   {languageOptions.map(lang => (
                     <option key={lang.id} value={lang.id}>{lang.name}</option>
                   ))}
                 </select>
               </div>
               <div>
                 <label htmlFor="font-family" className="block text-sm text-[var(--text-tertiary)] mb-1">Font Family</label>
                 <select
                   id="font-family"
                   value={fontFamily}
                   onChange={(e) => onFontFamilyChange(e.target.value)}
                   className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-secondary)] rounded-md p-2 text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--ring-color)] focus:border-[var(--ring-color)]"
                 >
                   {fontOptions.map(font => (
                     <option key={font.id} value={font.id}>{font.name}</option>
                   ))}
                 </select>
               </div>
               <div>
                  <label htmlFor="font-size" className="block text-sm text-[var(--text-tertiary)] mb-1">Font Size <span className="text-[var(--text-tertiary)]/80 font-mono">{fontSize}px</span></label>
                  <input
                      id="font-size"
                      type="range"
                      min="12"
                      max="24"
                      step="1"
                      value={fontSize}
                      onChange={(e) => onFontSizeChange(Number(e.target.value))}
                  />
               </div>
               <div>
                  <label htmlFor="line-height" className="block text-sm text-[var(--text-tertiary)] mb-1">Line Height <span className="text-[var(--text-tertiary)]/80 font-mono">{lineHeight.toFixed(1)}</span></label>
                  <input
                      id="line-height"
                      type="range"
                      min="1.2"
                      max="2.0"
                      step="0.1"
                      value={lineHeight}
                      onChange={(e) => onLineHeightChange(Number(e.target.value))}
                  />
               </div>
                <div className="flex items-center justify-between">
                  <label htmlFor="font-ligatures" className="text-sm text-[var(--text-tertiary)]">Font Ligatures</label>
                  <button
                    id="font-ligatures"
                    role="switch"
                    aria-checked={fontLigatures}
                    onClick={() => onFontLigaturesChange(!fontLigatures)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--bg-secondary)] focus:ring-[var(--ring-color)] ${
                      fontLigatures ? 'bg-[var(--bg-interactive)]' : 'bg-[var(--bg-tertiary)]'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        fontLigatures ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
            </div>
          </div>
          
          {/* AI Section */}
          <div className="settings-section">
            <h3 className="text-lg font-medium text-[var(--text-primary)] mb-3">AI Configuration</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[var(--text-tertiary)] mb-2">API Keys</label>
                <div className="space-y-3 p-3 bg-[var(--bg-tertiary)] rounded-md border border-[var(--border-secondary)]">
                   <div>
                       <label htmlFor="api-key-gemini" className="block text-sm font-medium text-[var(--text-primary)]">Google Gemini</label>
                       <input
                           id="api-key-gemini"
                           type="text"
                           placeholder="Using pre-configured key"
                           disabled
                           className="mt-1 w-full bg-[var(--bg-quaternary)] border border-[var(--border-secondary)] rounded-md p-2 text-[var(--text-tertiary)] cursor-not-allowed"
                       />
                       <p className="text-xs text-[var(--text-tertiary)] mt-1">
                           The API key is securely managed by the application's environment.
                       </p>
                   </div>
                   <div>
                       <label htmlFor="api-key-openai" className="block text-sm text-[var(--text-tertiary)]">OpenAI (ChatGPT)</label>
                       <input
                           id="api-key-openai"
                           type="password"
                           placeholder="Coming soon"
                           disabled
                           className="mt-1 w-full bg-[var(--bg-quaternary)] border border-[var(--border-secondary)] rounded-md p-2 text-[var(--text-tertiary)] cursor-not-allowed"
                       />
                   </div>
                   <div>
                       <label htmlFor="api-key-deepseek" className="block text-sm text-[var(--text-tertiary)]">DeepSeek</label>
                       <input
                           id="api-key-deepseek"
                           type="password"
                           placeholder="Coming soon"
                           disabled
                           className="mt-1 w-full bg-[var(--bg-quaternary)] border border-[var(--border-secondary)] rounded-md p-2 text-[var(--text-tertiary)] cursor-not-allowed"
                       />
                   </div>
                </div>
              </div>
              <div>
                <label className="block text-sm text-[var(--text-tertiary)] mb-2">Gemini Model Preference</label>
                <div className="flex bg-[var(--bg-tertiary)] p-1 rounded-md">
                  {modelOptions.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => onModelPreferenceChange(opt.id)}
                      className={`w-full p-2 rounded text-center text-sm font-semibold transition-colors duration-200 ${
                        modelPreference === opt.id
                          ? 'bg-[var(--bg-interactive)] text-[var(--text-on-interactive)] shadow-sm'
                          : 'text-[var(--text-secondary)] hover:bg-[var(--bg-quaternary)]'
                      }`}
                    >
                      {opt.name}
                    </button>
                  ))}
                </div>
                 <p className="text-xs text-[var(--text-tertiary)] mt-2">
                  "Quality" uses a more powerful model for deeper analysis. "Speed" uses a faster model for quicker results.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="p-4 bg-[var(--bg-secondary)] border-t border-[var(--border-primary)] flex justify-between items-center flex-shrink-0">
            <button
                onClick={onReset}
                className="text-sm text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] px-3 py-2 rounded-md transition-colors"
            >
                Reset to Defaults
            </button>
            <button
              onClick={onClose}
              className="bg-[var(--bg-interactive)] hover:bg-[var(--bg-interactive-hover)] text-[var(--text-on-interactive)] font-semibold py-2 px-4 rounded-md transition-colors"
            >
                Done
            </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
