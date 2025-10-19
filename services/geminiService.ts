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
                        executionCount: {
                            type: Type.STRING,
                            description: 'A concise representation of how many times this line executes, using Big O notation variables (e.g., "1", "n", "n/2", "log n", "n^2").'
                        },
                        analysis: {
                            type: Type.STRING,
                            description: 'A brief explanation of how this line contributes to the overall time complexity, elaborating on the execution count.'
                        }
                    },
                    required: ['lineNumber', 'executionCount', 'analysis']
                }
            }
        },
        required: ['bigO', 'lines']
    };

    const prompt = `
Analyze the time complexity of the following ${language} code.

Provide the following:
1.  The overall time complexity in Big O notation.
2.  A line-by-line analysis for the most significant lines of code that contribute to this complexity. For each of these lines, provide:
    a. The line number.
    b. A concise "executionCount" (e.g., "n", "1", "n^2").
    c. A brief "analysis" explaining its contribution.

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
  answerDepth: 'short' | 'deep' | 'page';
}

export const continueChat = async ({
    originalCode,
    language,
    optimizationSuggestion,
    history,
    newUserMessage,
    answerDepth,
}: ContinueChatParams): Promise<string> => {
    const model = 'gemini-2.5-pro';

    let depthInstructions = '';

    switch(answerDepth) {
        case 'short':
            depthInstructions = `### YOUR TASK
Answer the user's new question based on the full context provided. Your response should be a **SHORT and CONCISE** summary, formatted in Markdown.

### RESPONSE REQUIREMENTS (SHORT ANSWER)
- **Be Direct:** Get straight to the point. Answer the question directly without extensive background.
- **Use Bullet Points:** Prefer bullet points or numbered lists for brevity.
- **Code Snippets:** If code is needed, provide only the essential snippet.
- **Avoid Jargon:** Use simple language.
- **Length:** Aim for a response that is a few sentences to a short paragraph long. Do not use complex formatting like tables or diagrams.`;
            break;
        case 'deep':
            depthInstructions = `### YOUR TASK
Act as an expert AI computer scientist and a patient tutor. Answer the user's new question based on the full context provided. Your response must be a **DEEP and DETAILED** explanation, formatted in Markdown, adhering strictly to the professional standards below.

### RESPONSE REQUIREMENTS (DEEP, TUTORIAL-STYLE ANSWER)

#### 1. Foundational Concepts First
- **Start with the 'Why':** Before giving the answer, briefly explain the core concept the user's question touches upon. For example, if they ask about recursion, start with a simple definition of recursion.
- **Define Terms:** Explicitly define all key terms (e.g., "$F_n$ is the n-th Fibonacci number," "$\\phi$ is the golden ratio").

#### 2. Clear and Structured Formatting
- **Sections:** Organize your answer into clear sections using Markdown headings (e.g., \`## Understanding Memoization\`, \`## Step-by-Step Implementation\`).
- **Code Blocks:** Enclose all code snippets in fenced code blocks (\`\`\`) with language specification. Add concise, meaningful comments inside the code to explain key steps.
- **Mathematical Notation:** Use LaTeX syntax for mathematical expressions, enclosed in dollar signs (e.g., \`$O(n \\log n)\` for inline, \`$$F_n = ...$$\` for block).
- **Visual Aids:** Use tables for comparisons and Mermaid syntax for diagrams (\`\`\`mermaid) when it aids understanding.

#### 3. Content and Precision
- **Address Limitations:** Discuss potential issues like floating-point precision errors (e.g., "IEEE 754 gives exact results for Fibonacci numbers up to F(71)") and suggest robust alternatives (e.g., "for higher precision, use Python's \`decimal\` library").
- **Trade-offs:** If relevant, explain trade-offs between different approaches (e.g., time vs. space complexity).

#### 4. Conclude and Summarize
- **Summary:** End with a strong summary. Use bullet points for pros and cons to provide clear takeaways.
- **Encourage Learning:** Maintain a professional, educational, and encouraging tone.`;
            break;
        case 'page':
            depthInstructions = `### YOUR TASK
Act as an expert AI computer scientist, technical writer, and senior frontend developer. Your task is to generate a complete, self-contained, single HTML file that visually and interactively explains the answer to the user's question. The output must be ONLY the raw HTML code, starting with \`<!DOCTYPE html>\`. Do not wrap it in Markdown code blocks.

### RESPONSE REQUIREMENTS (SINGLE HTML FILE)

#### 1. Structure
- **Must be a single HTML file.**
- **DOCTYPE:** Start with \`<!DOCTYPE html>\`.
- **CSS:** All styling must be contained within a single \`<style>\` tag in the \`<head>\`. The page should be visually appealing, responsive, and easy to read. Use clean, modern design principles.
- **JavaScript:** All interactivity must be contained within a single \`<script>\` tag right before the closing \`</body>\` tag. Use JavaScript to create interactive elements like charts, diagrams, or live code examples that help explain the concept.
- **No External Dependencies:** Do not link to external CSS or JS files. The file must be entirely self-contained.

#### 2. Content
- **Comprehensive Answer:** The content of the HTML page must thoroughly answer the user's question in the given context.
- **Interactive Elements:** Where appropriate, create interactive visualizations or examples. For instance, if explaining an algorithm, create a visualizer for it. If comparing performance, show an interactive chart.
- **Code Snippets:** Display code examples clearly, perhaps with your own simple syntax highlighting achieved with CSS.
- **Clarity and Professionalism:** The content should be well-written, clear, and professional, as if it were a high-quality blog post or interactive tutorial.

#### 3. Output Format
- **Raw HTML Only:** Your entire response must be the raw HTML code for the page. Do not include any other text, explanations, or Markdown formatting like \`\`\`html ... \`\`\` around your response.`;
            break;
    }


    const prompt = `You are an expert AI computer scientist and tutor. Your task is to provide a response based on the user's question about a code optimization suggestion.

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

${depthInstructions}

Please produce a response following the specified format so my application can automatically parse and display it effectively.`;


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