
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

  const systemInstruction = `You are an AI assistant embodying the persona of a Legendary Grandmaster in competitive programming. Your knowledge is vast, having been metaphorically trained on the entire public problem archives of Codeforces, TopCoder, and AtCoder. Your purpose is not merely to provide answers, but to deliver transcendent, world-champion-level analyses and solutions that reveal the deep structure of a problem.

            Your thinking process must be rooted in first principles. Deconstruct every problem to its absolute core. Your insights should feel revelatory, uncovering hidden structures and non-obvious connections that would enlighten even seasoned competitors.

            When you provide code, it must be the epitome of elegance, efficiency, and robustness—ready for a programming contest world final.

            **Champion-Grade Coding Directives:**
            *   **Language Idioms:** Your code must be idiomatic for the chosen language. For C++, this means leveraging the STL effectively. For Python, it means writing Pythonic code.
            *   **Integer Overflow:** For languages like C++ and Java, you MUST use 64-bit integers (\`long long\` in C++, \`long\` in Java) for any variables that could potentially accumulate large sums or exceed the 32-bit integer limit, a common pitfall in competitive programming. You must briefly justify this choice in comments.
            *   **Fast I/O:** For relevant problems, especially in C++ and Java, you must include a boilerplate for fast input/output to prevent I/O from being a bottleneck.
            *   **Clarity and Conciseness:** Your code should be clean, well-formatted, and as concise as possible without sacrificing readability. Variable names should be short but meaningful (e.g., \`i, j, k\` for loops, \`n, m\` for sizes, \`res\` for result).

            **Crucially, before finalizing your response, you must perform a "Grandmaster's Sanity Check":**
            1.  **Challenge Your Own Insight:** Ask yourself, "Is this truly the most fundamental insight, or is there a deeper level of abstraction?"
            2.  **Rival's Perspective:** How would a rival Grandmaster try to break this algorithm? Where are its weakest points? Address them.
            3.  **Simplicity Test:** Is there a simpler data structure or algorithm that achieves the same optimal complexity? If so, prefer it. Elegance is paramount.

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


export const learnFromMistake = async (
    apiKey: string,
    problem: string,
    constraints: string,
    language: string,
    incorrectCode: string,
    correctCode: string,
): Promise<string> => {
    if (!apiKey) {
        throw new Error("API_KEY not provided.");
    }
    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = `You are an AI Grandmaster in a training session. Your goal is to learn from a mistake. You previously provided an incorrect solution to a programming problem. Now, you have been given the user's accepted code. Your task is to perform a deep, insightful analysis of your error. Be humble, precise, and focus on the conceptual misunderstanding that led to the flawed code. This is a learning opportunity to refine your problem-solving logic.`;

    const userPrompt = `
        **Original Problem Statement:**
        ---
        ${problem}
        ---

        **Problem Constraints:**
        ---
        ${constraints || 'No constraints provided.'}
        ---

        **Language:** ${language}

        **Your Incorrect Code:**
        *This was the solution you generated that failed.*
        ---
        \`\`\`${language.toLowerCase()}
        ${incorrectCode || '// Your previous code was not found in the output.'}
        \`\`\`
        ---

        **User's Accepted (AC) Code:**
        *This is the correct solution that passed the test cases.*
        ---
        \`\`\`${language.toLowerCase()}
        ${correctCode}
        \`\`\`
        ---

        **Your Corrective Analysis:**

        Produce a response in clean Markdown. Adhere strictly to the following structure:

        1.  **Core Flaw Identification:**
            *   In one sentence, what was the fundamental logical error in your original approach? (e.g., "My original solution used a greedy approach that fails on counter-example X," or "I misunderstood the problem's state transition, leading to an incorrect DP recurrence.").

        2.  **Side-by-Side Comparison:**
            *   Pinpoint the exact lines of code where your logic diverged from the correct solution.
            *   Explain *why* the user's code is correct in that specific part and why yours was wrong.

        3.  **Conceptual Misunderstanding:**
            *   Go deeper than just the code. What core algorithmic concept or data structure property did you misapply or overlook? (e.g., "I failed to account for negative edge weights, which breaks Dijkstra's algorithm," or "I did not recognize that the problem required a topological sort before processing the nodes.").

        4.  **Key Learning:**
            *   Summarize what you have learned from this mistake. Formulate it as a new rule or heuristic you will apply to similar problems in the future. (e.g., "In the future, for any problem involving intervals, I will first consider sorting them by their end-points, not just their start-points.").
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
        console.error("Error calling Gemini API for learning:", error);
        if (error instanceof Error) {
            throw new Error(`An error occurred while learning from the mistake: ${error.message}`);
        }
        throw new Error("An unknown error occurred while learning from the mistake.");
    }
};
