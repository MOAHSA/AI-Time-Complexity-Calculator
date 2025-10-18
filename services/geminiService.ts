
import { GoogleGenAI, Type } from "@google/genai";
import type { Language, AnalysisResult } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // This is a placeholder for environments where the key is not set.
  // In the target runtime, process.env.API_KEY is expected to be available.
  console.warn("API_KEY is not set. Using a placeholder.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY || "YOUR_API_KEY_HERE" });

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    bigO: {
      type: Type.STRING,
      description: "The overall time complexity in Big O notation, e.g., O(n^2).",
    },
    lines: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          lineNumber: {
            type: Type.INTEGER,
            description: "The 1-based line number corresponding to the original code.",
          },
          analysis: {
            type: Type.STRING,
            description: "A formula or description of how many times this line executes.",
          },
        },
        required: ["lineNumber", "analysis"],
      },
    },
  },
  required: ["bigO", "lines"],
};

export const analyzeCodeComplexity = async (code: string, language: Language): Promise<AnalysisResult> => {
  if (!code.trim()) {
    return { bigO: 'O(1)', lines: [] };
  }

  const prompt = `
    You are an expert algorithm analyst. Your task is to analyze the time complexity of the provided code snippet and return a detailed analysis in a structured JSON format.

    Analyze the following ${language} code:
    \`\`\`${language}
    ${code}
    \`\`\`

    Your response MUST be a single, valid JSON object that adheres to the provided schema. Do not include any explanatory text, markdown formatting, or anything outside of the JSON object.

    - For the \`bigO\` key, provide the tightest possible Big O notation.
    - For the \`lines\` array, provide an object for every single line of the input code.
    - The \`analysis\` for each line should be a mathematical formula in terms of input variables (like 'n') representing its execution count.
    - For loops (for, while), the analysis should count how many times the loop condition is evaluated.
    - For code inside a loop, the analysis should reflect that it runs for each iteration.
    - For declarations, comments, or blank lines, provide a simple, descriptive analysis like "Declaration", "Comment", or "Empty line".
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.1,
      },
    });

    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText);
    
    // Ensure the result conforms to the AnalysisResult type
    if (result && typeof result.bigO === 'string' && Array.isArray(result.lines)) {
      return result as AnalysisResult;
    } else {
      throw new Error("Invalid JSON structure received from API.");
    }

  } catch (error) {
    console.error("Error analyzing code complexity:", error);
    let errorMessage = "Failed to analyze code. Please check the console for details.";
    if (error instanceof Error) {
        errorMessage = `API Error: ${error.message}`;
    }
    // Return a structured error response
    return {
      bigO: "Error",
      lines: [{ lineNumber: 1, analysis: errorMessage }],
    };
  }
};
