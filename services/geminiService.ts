

import { GoogleGenAI, Type } from "@google/genai";
import type { Language, AnalysisResult } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // This is a placeholder for environments where the key is not set.
  // In the target runtime, process.env.API_KEY is expected to be available.
  console.warn("API_KEY is not set. Using a placeholder.");
}

// FIX: Per coding guidelines, initialize GoogleGenAI with a named `apiKey` parameter.
// The fallback to an empty string prevents a crash if the key is missing, although API calls will fail.
const ai = new GoogleGenAI({ apiKey: API_KEY || "" });

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
    You are a world-class algorithm analyst and computer science professor. Your task is to perform a rigorous time complexity analysis of the provided code snippet. Your analysis must be extremely accurate and detailed.

    Analyze the following ${language} code:
    \`\`\`${language}
    ${code}
    \`\`\`

    **CRITICAL INSTRUCTIONS:**
    1.  Your response MUST be a single, valid JSON object that adheres to the provided schema.
    2.  Do NOT include any explanatory text, markdown formatting, or anything outside of the JSON object.

    **ANALYSIS GUIDELINES:**

    **For the overall \`bigO\` complexity:**
    *   Provide the **tightest possible worst-case** Big O notation.
    *   Always simplify the final expression. For instance, O(n^2 + n) must be simplified to O(n^2).
    *   Identify the key input variables that determine complexity (e.g., 'n', the length of an array) and express the complexity in terms of these variables.

    **For the line-by-line \`lines\` analysis:**
    *   Provide an entry for **every single line** of the input code, including comments and blank lines.
    *   The \`analysis\` for each line must be a mathematical formula representing its execution count in terms of the input variables.
    *   **Constant time operations** (assignments, arithmetic, single returns) have an execution count of '1'.
    *   **Logarithmic loops** (e.g., \`i *= 2\`, \`n /= 2\`) should be identified and their execution count expressed as 'log(n)'.
    *   **Recursive function calls** should be analyzed by stating the recurrence relation, e.g., 'T(n) = 2*T(n/2) + n'.
    *   For lines **inside loops**, their total execution count is the count of the line's own operation multiplied by the number of times the loop(s) run.
    *   For declarations, comments, or blank lines, use a descriptive string like 'Declaration', 'Comment', or 'Empty line'.

    **EXAMPLE:**

    If the input code is:
    \`\`\`python
    def example_function(n):
        i = 1
        while i < n: # Loop condition check
            print(i)
            i *= 2 # Key operation for complexity
    \`\`\`

    A perfect response would be:
    \`\`\`json
    {
      "bigO": "O(log n)",
      "lines": [
        { "lineNumber": 1, "analysis": "Function declaration" },
        { "lineNumber": 2, "analysis": "1" },
        { "lineNumber": 3, "analysis": "log2(n) + 1" },
        { "lineNumber": 4, "analysis": "log2(n)" },
        { "lineNumber": 5, "analysis": "log2(n)" }
      ]
    }
    \`\`\`
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.0,
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