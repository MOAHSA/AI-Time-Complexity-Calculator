export interface LineAnalysis {
  lineNumber: number;
  analysis: string;
}

export interface AnalysisResult {
  bigO: string;
  lines: LineAnalysis[];
}

export type Language = 'python' | 'java' | 'cpp';
