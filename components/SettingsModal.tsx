
import React from 'react';
import type { Language } from '../types';

interface SettingsModalProps {
  currentLanguage: Language;
  onLanguageChange: (language: Language) => void;
  fontFamily: string;
  onFontFamilyChange: (font: string) => void;
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  lineHeight: number;
  onLineHeightChange: (height: number) => void;
  onClose: () => void;
}

const languageOptions: { id: Language; name: string }[] = [
  { id: 'python', name: 'Python' },
  { id: 'java', name: 'Java' },
  { id: 'cpp', name: 'C++' },
];

const fontOptions = [
  { id: `'Fira Code', monospace`, name: 'Fira Code' },
  { id: `'Source Code Pro', monospace`, name: 'Source Code Pro' },
  { id: `'Roboto Mono', monospace`, name: 'Roboto Mono' },
  { id: `'JetBrains Mono', monospace`, name: 'JetBrains Mono' },
  { id: `monospace`, name: 'Monospace' },
];

const SettingsModal: React.FC<SettingsModalProps> = ({ 
  currentLanguage, 
  onLanguageChange, 
  fontFamily,
  onFontFamilyChange,
  fontSize,
  onFontSizeChange,
  lineHeight,
  onLineHeightChange,
  onClose }) => {
  return (
    <div 
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md m-4"
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-100">Settings</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500"
            aria-label="Close settings"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-2">Language</h3>
            <div className="grid grid-cols-3 gap-4">
              {languageOptions.map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => onLanguageChange(lang.id)}
                  className={`w-full p-3 rounded-md text-center font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 ${
                    currentLanguage === lang.id
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                  }`}
                >
                  {lang.name}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-700/50"></div>

          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-2">Appearance</h3>
            <div className="space-y-4">
               <div>
                 <label htmlFor="font-family" className="block text-sm text-gray-400 mb-1">Font Family</label>
                 <select
                   id="font-family"
                   value={fontFamily}
                   onChange={(e) => onFontFamilyChange(e.target.value)}
                   className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                 >
                   {fontOptions.map(font => (
                     <option key={font.id} value={font.id}>{font.name}</option>
                   ))}
                 </select>
               </div>
               <div>
                  <label htmlFor="font-size" className="block text-sm text-gray-400 mb-1">Font Size <span className="text-gray-500 font-mono">{fontSize}px</span></label>
                  <input
                      id="font-size"
                      type="range"
                      min="12"
                      max="24"
                      step="1"
                      value={fontSize}
                      onChange={(e) => onFontSizeChange(Number(e.target.value))}
                      className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                  />
               </div>
               <div>
                  <label htmlFor="line-height" className="block text-sm text-gray-400 mb-1">Line Height <span className="text-gray-500 font-mono">{lineHeight.toFixed(1)}</span></label>
                  <input
                      id="line-height"
                      type="range"
                      min="1.2"
                      max="2.0"
                      step="0.1"
                      value={lineHeight}
                      onChange={(e) => onLineHeightChange(Number(e.target.value))}
                      className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                  />
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
