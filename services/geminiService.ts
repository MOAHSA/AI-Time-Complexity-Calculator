import { GoogleGenAI, Type } from '@google/genai';
import type {
  AnalysisResult,
  OptimizationResult,
  Language,
  ConcreteLanguage,
  ChatMessage,
} from '../types';

// According to guidelines, API key is in process.env.API_KEY
// and we should initialize with it.
// FIX: Initialize GoogleGenAI with apiKey from environment variables.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getLanguage = async (code: string, languageHint: Language): Promise<ConcreteLanguage> => {
    if (languageHint !== 'auto') {
        return languageHint;
    }
    
    // FIX: Use gemini-2.5-flash for simple classification tasks.
    const model = 'gemini-2.5-flash';
    
    try {
        // FIX: Call generateContent to get model response.
        const response = await ai.models.generateContent({
            model: model,
            contents: `Detect the programming language of the following code. Respond with only one of 'python', 'java', or 'cpp'.\n\nCode:\n\`\`\`\n${code}\n\`\`\``,
            config: {
                temperature: 0,
            }
        });

        // FIX: Extract text from response using the .text property.
        const lang = response.text.trim().toLowerCase();
        if (lang === 'python' || lang === 'java' || lang === 'cpp') {
            return lang;
        }
        // Fallback or error
        console.warn('Language detection failed, falling back to python. Response:', lang);
        return 'python';
    } catch (error) {
        console.error('Error detecting language:', error);
        // Fallback in case of API error
        return 'python';
    }
};

export const analyzeCode = async (code: string, language: ConcreteLanguage): Promise<AnalysisResult> => {
    // FIX: Use gemini-2.5-pro for complex reasoning tasks like code analysis.
    const model = 'gemini-2.5-pro';
    
    // FIX: Define response schema for structured JSON output.
    const analysisSchema = {
        type: Type.OBJECT,
        properties: {
            bigO: {
                type: Type.STRING,
                description: 'The overall time complexity of the code in Big O notation (e.g., "O(n)", "O(n^2)", "O(log n)").'
            },
            lines: {
                type: Type.ARRAY,
                description: 'An array of objects, where each object represents a line of code that contributes to the complexity.',
                items: {
                    type: Type.OBJECT,
                    properties: {
                        lineNumber: {
                            type: Type.INTEGER,
                            description: 'The 1-based line number in the code.'
                        },
                        analysis: {
                            type: Type.STRING,
                            description: 'A brief explanation of how this line contributes to the overall time complexity, including execution count if applicable.'
                        }
                    },
                    required: ['lineNumber', 'analysis']
                }
            }
        },
        required: ['bigO', 'lines']
    };

    const prompt = `
Analyze the time complexity of the following ${language} code.

Provide the following:
1.  The overall time complexity in Big O notation.
2.  A line-by-line analysis for the most significant lines of code that contribute to this complexity. For each of these lines, provide the line number and a brief explanation of its contribution (e.g., "This loop runs n times").

Your response must be in JSON format matching the provided schema.

Code:
\`\`\`${language}
${code}
\`\`\`
`;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: analysisSchema,
            }
        });

        const jsonString = response.text;
        return JSON.parse(jsonString) as AnalysisResult;

    } catch (error) {
        console.error('Error analyzing code:', error);
        throw new Error('Failed to analyze code with Gemini API.');
    }
};


export const optimizeCode = async (code: string, language: ConcreteLanguage): Promise<OptimizationResult> => {
    const model = 'gemini-2.5-pro';

    const optimizationSchema = {
        type: Type.OBJECT,
        properties: {
            optimized: {
                type: Type.BOOLEAN,
                description: 'A boolean indicating if the provided code is already considered optimal for its task. Set to true if no significant improvements can be made.'
            },
            suggestion: {
                type: Type.STRING,
                description: 'A detailed, step-by-step explanation of how to optimize the code. If the code is already optimal, provide a brief explanation of why. The explanation should be in Markdown format.'
            },
            resources: {
                type: Type.ARRAY,
                description: 'An array of up to 3 relevant learning resources (articles, YouTube videos, documentation) that help understand the optimization concepts.',
                items: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        url: { type: Type.STRING },
                        type: { 
                            type: Type.STRING,
                            enum: ['article', 'video', 'github', 'documentation', 'other']
                        }
                    },
                    required: ['title', 'url', 'type']
                }
            }
        },
        required: ['optimized', 'suggestion', 'resources']
    };

    const prompt = `
Analyze and suggest optimizations for the following ${language} code to improve its time complexity or performance.

Your response must be a JSON object that adheres to the provided schema.
- If the code is already optimal, set "optimized" to true and explain why in the "suggestion" field.
- If it can be improved, set "optimized" to false, provide a detailed "suggestion" in Markdown format on how to improve it (you can include code snippets using Markdown).
- Provide up to 3 relevant "resources" for further learning. When searching for resources, prioritize including at least one high-quality YouTube video tutorial if available on the topic.

Code:
\`\`\`${language}
${code}
\`\`\`
`;

    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: optimizationSchema,
            }
        });

        const jsonString = response.text;
        return JSON.parse(jsonString) as OptimizationResult;

    } catch (error) {
        console.error('Error optimizing code:', error);
        throw new Error('Failed to get optimization from Gemini API.');
    }
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
    const model = 'gemini-2.5-pro';

    const prompt = `You are an expert AI computer scientist and tutor. Your task is to provide detailed, well-structured, and easy-to-render responses formatted in Markdown, based on the user's question about a code optimization suggestion.

### CONTEXT
The user is asking a follow-up question about a code optimization suggestion.
- Original ${language} code:
\`\`\`${language}
${originalCode}
\`\`\`
- Your initial optimization suggestion:
---
${optimizationSuggestion}
---
- Conversation History:
${history.map(msg => `${msg.role === 'user' ? 'User' : 'AI'}: ${msg.content}`).join('\n')}

### USER'S NEW QUESTION
${newUserMessage}

### YOUR TASK
Answer the user's new question based on the full context provided, adhering strictly to the following professional standards and formatting requirements.

### RESPONSE REQUIREMENTS

#### 1. Formatting and Clarity
- **Structure:** Start with a "### Short Answer" section that provides a concise, direct summary. Follow this with a "### Deep Answer" section for the full, detailed explanation including examples, tables, and diagrams.
- **Sections:** Within the "Deep Answer", organize your content into clear sub-sections using Markdown headings (e.g., \`## Binet’s Formula\`, \`## Python Implementation\`).
- **Readability:** Break long paragraphs into shorter, more digestible ones.
- **Code Blocks:** Enclose all code snippets in fenced code blocks (\`\`\`) and specify the programming language.
- **Mathematical Notation:** Use LaTeX syntax for mathematical expressions, enclosed in dollar signs (e.g., \`$O(n \\log n)\` for inline, \`$$F_n = ...$$\` for block).
- **Tables:** If comparing concepts, provide data in a well-formatted Markdown table with a clear header row.
- **Diagrams:** When helpful, include flowcharts or diagrams using Mermaid syntax inside a \`\`\`mermaid fenced code block.

#### 2. Content and Precision
- **Define Terms:** Explicitly define key terms (e.g., "$F_n$ is the n-th Fibonacci number," "$\\phi$ is the golden ratio").
- **Code Comments:** Add concise, meaningful comments inside code blocks to explain key steps.
- **Numerical Stability:** Precisely address limitations, such as floating-point precision errors (e.g., "IEEE 754 double precision gives exact integer results for Fibonacci numbers up to F(71)").
- **Alternatives:** When discussing limitations, suggest robust alternatives (e.g., "for higher precision, use Python's \`decimal\` library").

#### 3. Structure and Tone
- **Conclusion:** End the "Deep Answer" with a strong summary. Use bullet points for pros and cons to provide clear takeaways.
- **Style:** Maintain a professional, educational tone. Use active voice where possible.
- **Follow-up:** After the main content, provide a "### Suggested Questions" section with 2-3 relevant follow-up questions the user might have.

Please produce a response following this structure so my application can automatically parse and display it effectively.`;


    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
        });

        return response.text;
    } catch (error) {
        console.error('Error continuing chat:', error);
        throw new Error('Failed to get chat response from Gemini API.');
    }
};