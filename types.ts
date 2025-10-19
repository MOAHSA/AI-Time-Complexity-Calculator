import React from 'react';

// FIX: Add all necessary type definitions and export them.
export type ConcreteLanguage = 'python' | 'java' | 'cpp';
export type Language = ConcreteLanguage | 'auto';
export type ModelPreference = 'speed' | 'quality';

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

export interface RecommendedQuestion {
    question: string;
    depth: 'short' | 'deep' | 'page';
}

export interface OptimizationResult {
  optimized: boolean;
  suggestion: string;
  resources: OptimizationResource[];
  recommendedQuestions?: RecommendedQuestion[];
}

export interface ChatMessage {
  role: 'user' | 'model' | 'loading';
  content: string;
  format: 'markdown' | 'html';
}

export interface AnalysisHistoryItem {
  id: string;
  timestamp: number;
  originalCode: string;
  language: ConcreteLanguage;
  result: AnalysisResult;
}

export interface OptimizationHistoryItem {
  id: string;
  timestamp: number;
  originalCode: string;
  language: ConcreteLanguage;
  result: OptimizationResult;
  chatHistory: ChatMessage[];
  recommendedQuestions?: RecommendedQuestion[];
}