import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY || "",
});

// Next.js 16 App Router - increase body size limit
export const runtime = 'nodejs';
export const maxDuration = 60; // Maximum function duration in seconds

interface RefineRequestBody {
  imageBase64: string;
  previousCode: string;
  userPrompt: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: RefineRequestBody = await req.json();
    const { imageBase64, previousCode, userPrompt } = body;

    if (!imageBase64 || !previousCode || !userPrompt) {
      return NextResponse.json(
        { error: 'Missing required data for refinement' },
        { status: 400 }
      );
    }

    // The specialized "Refinement Prompt"
    const REFINEMENT_SYSTEM_PROMPT = `
    You are an expert React/Tailwind developer.
    Your task is to MODIFY existing code based on a user's request.

    Inputs you have:
    1. ORIGINAL_IMAGE: The initial sketch (for visual context).
    2. EXISTING_CODE: The code you previously generated.
    3. USER_INSTRUCTION: What the user wants to change (e.g., "make the button bigger").

    Rules:
    1. Apply the USER_INSTRUCTION to the EXISTING_CODE.
    2. Do NOT rewrite the whole app from scratch if not needed. Maintain the current structure.
    3. Output ONLY the new, complete, valid JSX code for the component.
    4. Do NOT include conversational text or markdown fences.
    5. Start immediately with 'export default function'.
    `;

    const combinedPrompt = `
    [EXISTING_CODE_START]
    ${previousCode}
    [EXISTING_CODE_END]

    USER_INSTRUCTION: ${userPrompt}

    Please update the code above following the instruction.
    `;

    // Extract mime type and base64 data properly
    const mimeTypeMatch = imageBase64.match(/^data:([^;]+);base64,/);
    const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : "image/png";
    
    // Remove the data URI prefix completely (handles both image/png and image/svg+xml)
    const base64Data = imageBase64.replace(/^data:[^;]+;base64,/, "");

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          inlineData: {
            mimeType: mimeType,
            data: base64Data,
          },
        },
        { text: REFINEMENT_SYSTEM_PROMPT },
        { text: combinedPrompt },
      ],
    });

    const text = response.text;

    if (!text) {
      throw new Error("No response text from Gemini");
    }

    let cleanCode = text;
    const codeBlockRegex = /```(?:jsx|js|javascript)?\n?([\s\S]*?)```/;
    const match = text.match(codeBlockRegex);
    if (match && match[1]) {
      cleanCode = match[1].trim();
    } else {
      cleanCode = text.trim();
    }

    return NextResponse.json({ code: cleanCode }, { status: 200 });

  } catch (error) {
    console.error("❌ Refinement Error:", error);
    return NextResponse.json(
      { error: 'Failed to refine code.' },
      { status: 500 }
    );
  }
}
