import { GoogleGenAI, Type, GenerateContentResponse } from '@google/genai';
import type { AnalysisResult, OptimizationResult, ConcreteLanguage, Language, ChatMessage } from '../types';

// Per guidelines, API key is from environment variable
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
// Fix: Use a recommended model for complex text tasks.
const model = 'gemini-2.5-pro'; // Good for code analysis

const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    bigO: {
      type: Type.STRING,
      description: 'The calculated Big O time complexity of the code. E.g., O(n), O(n^2), O(log n). If an error occurs or complexity cannot be determined, provide a brief error message starting with "Error:".',
    },
    lines: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          lineNumber: { type: Type.INTEGER, description: 'The 1-based line number in the code.' },
          analysis: { type: Type.STRING, description: 'A brief explanation of what this line does and its contribution to the overall complexity. Mention execution count if relevant. Keep it concise.' },
        },
        required: ['lineNumber', 'analysis'],
      },
    },
  },
  required: ['bigO', 'lines'],
};

const optimizationSchema = {
    type: Type.OBJECT,
    properties: {
        optimized: {
            type: Type.BOOLEAN,
            description: 'A boolean indicating if the provided code is already considered optimal or if no significant optimization is possible.'
        },
        suggestion: {
            type: Type.STRING,
            description: "A detailed explanation of the optimization. If `optimized` is false, this should include the suggested improved code block inside markdown triple backticks (```) and an explanation of why it's more efficient. If `optimized` is true, this can be a brief confirmation."
        },
        resources: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING, description: 'A descriptive title for the resource link.' },
                    url: { type: Type.STRING, description: 'A URL to a relevant article, documentation, or tutorial about the optimization technique or data structure.' },
                    type: { type: Type.STRING, description: 'The type of the resource. Must be one of: "article", "video", "github", "documentation", or "other".' },
                },
                required: ['title', 'url', 'type']
            },
        }
    },
    required: ['optimized', 'suggestion', 'resources']
};

const detectLanguagePrompt = `
Analyze the following code snippet and identify its programming language.
Respond with only one of the following options: "python", "java", or "cpp".
Do not provide any other text or explanation.

Code:
\`\`\`
{CODE}
\`\`\`
`;

const analysisPrompt = `
You are an expert in algorithm analysis. Analyze the time complexity of the following {LANGUAGE} code.
Provide a detailed line-by-line analysis of the execution count and its contribution to the overall complexity.
The line numbers in your response MUST correspond to the line numbers in the provided code.

Code:
\`\`\`{LANGUAGE}
{CODE}
\`\`\`
`;

const optimizationPrompt = `
You are an expert software engineer and AI research assistant specializing in performance optimization and educational content curation.

Task:
1.  Analyze the provided {LANGUAGE} code for performance bottlenecks.
2.  If it can be significantly optimized, provide an improved code version and a clear explanation of the changes.
3.  If the code is already optimal, state that and explain why.
4.  Concurrently, find up to 4 of the best, free online learning resources that explain the core concepts behind the optimization.

Context:
The user is a developer looking to understand *why* the optimized code is better, not just what the code is.
The resources you find must be high-quality and directly related to the algorithmic or language-specific improvement.
- For articles, prioritize well-respected blogs or educational platforms (e.g., GeeksforGeeks, freeCodeCamp).
- For videos, prioritize tutorials from reputable YouTube channels (e.g., university lectures, well-known developer channels).
- For GitHub, find well-documented example implementations, relevant libraries, or educational repositories.

Constraints:
- All resources must be freely accessible without a required sign-up or paywall.
- The total number of resources should not exceed 4. Aim for a diverse mix (e.g., one article, one video, one GitHub link).
- If no optimization is possible, the 'resources' array should be empty.

Code to analyze:
\`\`\`{LANGUAGE}
{CODE}
\`\`\`
`;

const chatPrompt = `
You are an expert AI assistant continuing a conversation with a developer about code optimization.

Here is the original context:
- Language: {LANGUAGE}
- Original Code:
\`\`\`{LANGUAGE}
{ORIGINAL_CODE}
\`\`\`
- Your Optimization Suggestion:
{OPTIMIZATION_SUGGESTION}

Here is the conversation history so far:
{CHAT_HISTORY}

The user's new message is: "{NEW_USER_MESSAGE}"

Your task is to provide a helpful and concise response that directly addresses the user's new message, keeping the full context in mind. Do not repeat information unless asked.
`;


async function detectLanguage(code: string): Promise<ConcreteLanguage> {
    try {
        const response = await ai.models.generateContent({
            model,
            contents: detectLanguagePrompt.replace('{CODE}', code),
        });
        const lang = response.text.trim().toLowerCase();
        if (lang === 'python' || lang === 'java' || lang === 'cpp') {
            return lang as ConcreteLanguage;
        }
        // Fallback or error
        console.warn("Could not reliably detect language, falling back to Python.");
        return 'python';
    } catch (error) {
        console.error('Error detecting language:', error);
        // Fallback
        return 'python';
    }
}

export async function getLanguage(code: string, language: Language): Promise<ConcreteLanguage> {
    if (language === 'auto') {
        return await detectLanguage(code);
    }
    return language;
}


export async function analyzeCode(code: string, language: ConcreteLanguage): Promise<AnalysisResult> {
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model,
            contents: analysisPrompt.replace('{LANGUAGE}', language).replace('{CODE}', code),
            config: {
                responseMimeType: 'application/json',
                responseSchema: analysisSchema,
            },
        });

        const jsonString = response.text;
        const result: AnalysisResult = JSON.parse(jsonString);
        return result;

    } catch (error) {
        console.error("Error analyzing code:", error);
        return {
            bigO: 'Error: Analysis failed',
            lines: []
        };
    }
}

export async function optimizeCode(code: string, language: ConcreteLanguage): Promise<OptimizationResult> {
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model,
            contents: optimizationPrompt.replace('{LANGUAGE}', language).replace('{CODE}', code),
            config: {
                responseMimeType: 'application/json',
                responseSchema: optimizationSchema,
            },
        });
        
        const jsonString = response.text;
        const result: OptimizationResult = JSON.parse(jsonString);
        return result;

    } catch (error) {
        console.error("Error optimizing code:", error);
        return {
            optimized: true, // assume no optimization possible on error
            suggestion: 'An error occurred while trying to generate an optimization suggestion. Please try again.',
            resources: []
        };
    }
}

export interface ChatContext {
  originalCode: string;
  language: ConcreteLanguage;
  optimizationSuggestion: string;
  history: ChatMessage[];
  newUserMessage: string;
}

export async function continueChat(context: ChatContext): Promise<string> {
    try {
        const historyString = context.history
            .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
            .join('\n');
            
        const prompt = chatPrompt
            .replace('{LANGUAGE}', context.language)
            .replace('{ORIGINAL_CODE}', context.originalCode)
            .replace('{OPTIMIZATION_SUGGESTION}', context.optimizationSuggestion)
            .replace('{CHAT_HISTORY}', historyString)
            .replace('{NEW_USER_MESSAGE}', context.newUserMessage);

        const response = await ai.models.generateContent({
            model,
            contents: prompt,
        });

        return response.text;
    } catch (error) {
        console.error("Error in chat:", error);
        return "I'm sorry, I encountered an error while processing your message. Please try again.";
    }
}
