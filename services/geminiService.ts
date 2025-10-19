
import { GoogleGenAI, Type } from "@google/genai";
import type { 
    Language, 
    ConcreteLanguage, 
    AnalysisResult, 
    OptimizationResult,
    ChatMessage
} from '../types';

// The API key is sourced from the environment variable as per the guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const model = 'gemini-2.5-flash';

// Utility function to parse JSON response from the model
const parseJsonResponse = <T>(text: string, typeName: string): T => {
    try {
        // The model may wrap JSON in ```json ... ```, so we clean it.
        const cleanedText = text.replace(/^```json\s*|```\s*$/g, '');
        return JSON.parse(cleanedText);
    } catch (error) {
        console.error(`Failed to parse ${typeName} JSON:`, text, error);
        throw new Error(`The model returned an invalid ${typeName} format.`);
    }
};

export const getLanguage = async (code: string, language: Language): Promise<ConcreteLanguage> => {
    if (language !== 'auto') {
        return language;
    }

    const response = await ai.models.generateContent({
        model,
        contents: `Detect the programming language of the following code. Respond with only one of: 'python', 'java', or 'cpp'.\n\n\`\`\`\n${code}\n\`\`\``,
    });
    
    const lang = response.text.trim().toLowerCase();

    if (lang === 'python' || lang === 'java' || lang === 'cpp') {
        return lang;
    }

    // Default if language is not supported/detected
    console.warn(`Could not detect language, defaulting to python. Detected: ${lang}`);
    return 'python';
};

export const analyzeCode = async (code: string, lang: ConcreteLanguage): Promise<AnalysisResult> => {
    const response = await ai.models.generateContent({
        model,
        contents: `Analyze the time complexity of the following ${lang} code. Provide the overall Big O notation and a line-by-line analysis of execution counts. For each line, explain why it's executed that many times in relation to the input size (e.g., "1", "N", "N^2"). Respond in JSON format.
        
        Example JSON format:
        {
          "bigO": "O(N)",
          "lines": [
            { "lineNumber": 1, "analysis": "Executed 1 time." },
            { "lineNumber": 2, "analysis": "Executed N times, where N is the length of the input array." }
          ]
        }
        
        Code to analyze:
        \`\`\`${lang}
        ${code}
        \`\`\``,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    bigO: { type: Type.STRING, description: "The overall Big O time complexity." },
                    lines: {
                        type: Type.ARRAY,
                        description: "A line-by-line analysis.",
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                lineNumber: { type: Type.INTEGER, description: "The 1-based line number." },
                                analysis: { type: Type.STRING, description: "The complexity analysis for this line." }
                            },
                            required: ['lineNumber', 'analysis']
                        }
                    }
                },
                required: ['bigO', 'lines']
            }
        }
    });
    
    return parseJsonResponse<AnalysisResult>(response.text, 'AnalysisResult');
};


export const optimizeCode = async (code: string, lang: ConcreteLanguage): Promise<OptimizationResult> => {
    const response = await ai.models.generateContent({
        model,
        contents: `Analyze the following ${lang} code for potential performance optimizations.
        1. Determine if the code is already optimal for its task or if improvements can be made.
        2. Provide a clear, concise, and actionable suggestion for optimization. If it's already optimal, state that.
        3. Provide a list of 2-3 relevant learning resources (articles, videos, documentation).
        
        Respond in JSON format.

        Code to analyze:
        \`\`\`${lang}
        ${code}
        \`\`\``,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    optimized: { type: Type.BOOLEAN, description: "True if the code is considered optimal, false otherwise." },
                    suggestion: { type: Type.STRING, description: "The optimization suggestion or a statement that it's optimal." },
                    resources: {
                        type: Type.ARRAY,
                        description: "A list of relevant learning resources.",
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                title: { type: Type.STRING },
                                url: { type: Type.STRING },
                                type: { type: Type.STRING, enum: ['article', 'video', 'github', 'documentation', 'other'] }
                            },
                            required: ['title', 'url', 'type']
                        }
                    }
                },
                required: ['optimized', 'suggestion', 'resources']
            }
        }
    });

    return parseJsonResponse<OptimizationResult>(response.text, 'OptimizationResult');
};

interface ContinueChatParams {
    originalCode: string;
    language: ConcreteLanguage;
    optimizationSuggestion: string;
    history: ChatMessage[];
    newUserMessage: string;
}

export const continueChat = async ({
    originalCode,
    language,
    optimizationSuggestion,
    history,
    newUserMessage
}: ContinueChatParams): Promise<string> => {
    
    const formattedHistory = history.map(msg => `${msg.role}: ${msg.content}`).join('\n');
    
    const response = await ai.models.generateContent({
        model,
        contents: newUserMessage,
        config: {
            systemInstruction: `You are an expert code optimization assistant. A user has received an optimization suggestion for their code and is asking a follow-up question.
            
            Original Code (${language}):
            \`\`\`${language}
            ${originalCode}
            \`\`\`
            
            Initial Suggestion:
            ${optimizationSuggestion}
            
            Conversation History:
            ${formattedHistory}
            
            Keep your answers concise, helpful, and directly related to the code and optimization suggestion. Address the user's latest message.`
        }
    });

    return response.text;
};
