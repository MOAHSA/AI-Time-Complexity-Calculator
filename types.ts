export interface LineAnalysis {
  lineNumber: number;
  analysis: string;
}

export interface AnalysisResult {
  bigO: string;
  lines: LineAnalysis[];
}

export interface OptimizationResult {
  optimized: boolean;
  suggestion: string;
}

export type ConcreteLanguage = 'python' | 'java' | 'cpp';
export type Language = 'auto' | ConcreteLanguage;
