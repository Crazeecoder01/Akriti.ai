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
    You are an expert HTML/CSS/Tailwind developer and design analyst.
    Your task is to INTELLIGENTLY MODIFY existing HTML code based on a user's request while understanding context.

    **CONTEXT AWARENESS:**
    1. Analyze the ORIGINAL_IMAGE to understand what was sketched
    2. Read any text in the sketch to understand the website's purpose and brand
    3. Understand the current EXISTING_CODE structure and design intent
    4. Apply USER_INSTRUCTION intelligently based on this context

    **INTELLIGENT IMAGE HANDLING (when relevant to changes):**
    1. **For logos and brand images:**
       - If brand names mentioned: Use \`https://logo.clearbit.com/{domain}.com\`
       - Alternative: \`https://img.logo.dev/{domain}.com?token=pk_X-DqKTuxQOuNvPn6T7bqUA\`
       - Fallback: \`https://ui-avatars.com/api/?name={BrandName}&size=200&background=random\`

    2. **For content images:**
       - Use context-appropriate Unsplash images: \`https://source.unsplash.com/800x600/?{keyword}\`
       - Keywords should match the site's context (tech, food, fashion, travel, etc.)

    3. **Maintain or improve** existing image choices unless user specifically requests changes

    **MODIFICATION RULES:**
    1. **Understand the intent** - If user says "make it modern", don't just change one thing, modernize the whole design
    2. **Be smart about changes**:
       - "Make it bigger" → Increase size proportionally, adjust spacing
       - "Change color" → Update color scheme cohesively across related elements
       - "Add a section" → Create it in the appropriate style matching the existing design
       - "Make it professional" → Refine typography, spacing, colors, add subtle effects
    3. **Maintain functionality** - Don't break existing JavaScript or interactive features
    4. **Improve while changing** - If making updates, also fix any minor issues you notice
    5. **Keep the structure** unless user explicitly asks to restructure
    6. **Preserve context** - Keep brand elements, logos, and theme consistent

    **OUTPUT REQUIREMENTS:**
    1. Output ONLY the complete, updated HTML document
    2. No markdown fences, no explanations
    3. Start with <!DOCTYPE html>
    4. Maintain Tailwind CSS usage
    5. Ensure responsive design is preserved
    6. Test that all changes are cohesive with the overall design

    **QUALITY:**
    - Professional, polished result
    - Smooth transitions and animations where appropriate
    - Accessibility maintained
    - Mobile responsiveness preserved
    `;

    const combinedPrompt = `
    [EXISTING_CODE_START]
    ${previousCode}
    [EXISTING_CODE_END]

    USER_INSTRUCTION: ${userPrompt}

    Please analyze the context, understand the intent, and update the code intelligently following the instruction.
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
    const codeBlockRegex = /```(?:html)?\n?([\s\S]*?)```/;
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
