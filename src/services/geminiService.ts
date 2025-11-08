
import { GoogleGenAI } from "@google/genai";
import { AnalysisType } from '../types';
import { ANALYSIS_OPTIONS } from '../constants';

const getAnalysisPrompt = (type: AnalysisType): string => {
    const option = ANALYSIS_OPTIONS.find(o => o.value === type);
    return option ? option.description : 'Analyze the code and problem.';
}

export const extractTextFromImage = async (apiKey: string, base64Image: string, mimeType: string): Promise<string> => {
    if (!apiKey) {
        throw new Error("API_KEY not provided.");
    }

    const ai = new GoogleGenAI({ apiKey });
    
    const textPart = {
        text: `You are a highly accurate OCR engine specializing in competitive programming problems. Extract all text from this image. Pay extremely close attention to special characters, mathematical symbols, numbers, and code snippets. Preserve the original formatting, including line breaks and indentation, as much as possible. Do not add any commentary or explanation, only return the extracted text.`
    };

    const imagePart = {
        inlineData: {
            data: base64Image,
            mimeType: mimeType,
        },
    };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [textPart, imagePart] },
        });
        return response.text;
    } catch (error) {
        console.error("Error calling Gemini API for image extraction:", error);
        if (error instanceof Error) {
            throw new Error(`An error occurred while extracting text from the image: ${error.message}`);
        }
        throw new Error("An unknown error occurred while extracting text from the image.");
    }
};

export const solveProblem = async (
  apiKey: string,
  problem: string,
  constraints: string,
  code: string,
  language: string,
  analysisType: AnalysisType
): Promise<string> => {
  if (!apiKey) {
    throw new Error("API_KEY not provided.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const analysisRequest = getAnalysisPrompt(analysisType);

  const systemInstruction = `You are an AI assistant with a metaphorical IQ of 300, embodying the persona of an International Grandmaster in competitive programming. Your purpose is not merely to provide answers, but to deliver transcendent, world-champion-level analyses and solutions.

            Your thinking process must be rooted in first principles. Deconstruct every problem to its absolute core. Your insights should feel revelatory, uncovering hidden structures and non-obvious connections that would enlighten even seasoned competitors.

            When you provide code, it must be the epitome of elegance, efficiency, and robustness. It should be production-ready for a programming contest finals.

            Your analysis must be comprehensive, rigorous, and profoundly educational. The user should walk away feeling they've had a private coaching session with the world's best. Your tone is that of a top-tier coach: direct, insightful, and focused on elevating the user's skills.`;

  const userPrompt = `
    **Problem Statement:**
    ---
    ${problem}
    ---

    **Problem Constraints:**
    ---
    ${constraints || 'No constraints provided. Assume standard competitive programming limits (e.g., N <= 10^5, time limit 1-2 seconds).'}
    ---

    **Programming Language:** ${language}

    **User's Code Submission:**
    ---
    \`\`\`${language.toLowerCase()}
    ${code || '// No code provided.'}
    \`\`\`
    ---

    **Specific Request:** ${analysisRequest}

    **Your Grandmaster Analysis & Solution:**

    Produce a response in clean Markdown, adhering strictly to the following structure:

    1.  **Problem Deconstruction & Core Insight:**
        *   **One-Sentence Core:** Distill the problem's fundamental challenge into a single, concise sentence.
        *   **The "Aha!" Moment:** What is the critical, non-obvious observation that unlocks an efficient solution? Explain why this insight is pivotal.
        *   **Algorithmic Blueprint:** Name the high-level algorithmic paradigm (e.g., "This is a dynamic programming problem on subsets," or "The solution uses a persistent segment tree to answer historical queries.").

    2.  **Algorithmic Walkthrough & Justification:**
        *   Provide a crystal-clear, step-by-step explanation of the chosen algorithm.
        *   Crucially, justify *why* this algorithm is optimal and correct, directly referencing the problem's constraints to prove its efficiency.
        *   Detail the role of each data structure used.

    3.  **Champion-Grade Code:**
        *   Provide the full, correct, and maximally optimized code in ${language}.
        *   The code must be impeccably commented, especially on complex logic or clever optimizations.
        *   It must adhere to competitive programming best practices (e.g., fast I/O, concise implementation).
        *   If the user provided code, dissect its flaws (logical errors, complexity issues) with surgical precision before presenting the corrected, superior version.

    4.  **Complexity Analysis:**
        *   Provide a rigorous analysis of both time and space complexity.
        *   Justify the analysis from first principles (e.g., "The time complexity is O(N log N) because each of the N elements is inserted once into a balanced binary search tree, where each insertion costs O(log N).").

    5.  **Corner Cases & Edge Case Analysis:**
        *   Explicitly list potential edge cases (e.g., empty input, single-element array, constraints at their maximum/minimum values).
        *   Explain how the provided code robustly handles each of these specific cases.

    6.  **Alternative Strategies & Why They're Inferior (Optional but encouraged):**
        *   Briefly discuss other possible approaches (e.g., brute-force, a naive greedy algorithm) and provide a clear, constraint-based argument for why they would fail (e.g., "A brute-force O(N^2) approach would time out given N <= 10^5").
    `;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: userPrompt,
        config: {
            systemInstruction: systemInstruction,
        }
    });
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        throw new Error(`An error occurred while communicating with the AI: ${error.message}`);
    }
    throw new Error("An unknown error occurred while communicating with the AI.");
  }
};
