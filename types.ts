export interface LineAnalysis {
  lineNumber: number;
  executionCount: string;
  analysis: string;
}

export interface AnalysisResult {
  bigO: string;
  lines: LineAnalysis[];
}

export interface OptimizationResource {
  title: string;
  url: string;
  type: 'article' | 'video' | 'github' | 'documentation' | 'other';
}

export interface OptimizationResult {
  optimized: boolean;
  suggestion: string;
  resources: OptimizationResource[];
}

export type ConcreteLanguage = 'python' | 'java' | 'cpp';
export type Language = 'auto' | ConcreteLanguage;

export interface ChatMessage {
  role: 'user' | 'model' | 'loading';
  content: string;
  format?: 'markdown' | 'html';
}

export interface OptimizationHistoryItem {
  id: string;
  timestamp: number;
  originalCode: string;
  language: ConcreteLanguage;
  result: OptimizationResult;
  chatHistory: ChatMessage[];
}