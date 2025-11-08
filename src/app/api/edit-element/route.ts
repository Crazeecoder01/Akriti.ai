import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY || "",
});

const getElementEditPrompt = (
  previousCode: string,
  selectedElementHTML: string,
  userPrompt: string
) => `
You are an expert frontend developer performing a SURGICAL, TARGETED edit on a specific HTML element.

**CRITICAL RULES:**
1. **ONLY modify the selected element** - Do NOT change anything else in the page
2. **Maintain the overall page structure** - Keep all other elements exactly as they are
3. **Apply ONLY the requested change** - Don't add features that weren't asked for
4. **Preserve functionality** - Keep existing classes, IDs, and JavaScript interactions
5. **Return the COMPLETE HTML document** with ONLY the selected element modified

**CURRENT FULL PAGE CODE:**
\`\`\`html
${previousCode}
\`\`\`

**SELECTED ELEMENT TO MODIFY:**
\`\`\`html
${selectedElementHTML}
\`\`\`

**USER'S REQUESTED CHANGE:**
${userPrompt}

**YOUR TASK:**
1. Locate the selected element in the full page code
2. Apply ONLY the requested change to that specific element
3. Keep everything else in the page EXACTLY the same
4. Return the complete HTML document with the modification applied

**IMPORTANT:**
- Return ONLY the complete HTML (no markdown code fences)
- Make surgical, precise changes
- Don't refactor or "improve" unrequested parts
- Preserve all Tailwind classes unless specifically asked to change them
- Keep all existing functionality, scripts, and styles intact

Now, apply the requested change to the selected element and return the updated full HTML.
`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { previousCode, selectedElementHTML, userPrompt, imageBase64 } = body;

    if (!previousCode || !selectedElementHTML || !userPrompt) {
      return NextResponse.json(
        { error: "Missing required fields: previousCode, selectedElementHTML, or userPrompt" },
        { status: 400 }
      );
    }

    const systemPrompt = getElementEditPrompt(previousCode, selectedElementHTML, userPrompt);

    // Prepare the request contents
    const contents: any[] = [];

    // Add image if provided (optional - for context)
    if (imageBase64) {
      const base64Data = imageBase64.replace(/^data:[^;]+;base64,/, "");
      const mimeType = imageBase64.match(/^data:([^;]+);base64,/)?.[1] || "image/png";
      
      contents.push({
        inlineData: {
          data: base64Data,
          mimeType: mimeType,
        },
      });
    }

    contents.push({ text: systemPrompt });

    console.log("🤖 Calling Gemini API for element edit...");
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
    });

    const text = response.text;
    console.log("✅ Gemini responded!");

    if (!text) {
      throw new Error("No response text from Gemini");
    }

    let generatedCode = text;

    // Clean up markdown code fences if present
    generatedCode = generatedCode
      .replace(/```html\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    // Validate that we got HTML back
    if (!generatedCode.includes("<!DOCTYPE") && !generatedCode.includes("<html")) {
      throw new Error("Generated response is not valid HTML");
    }

    return NextResponse.json({ code: generatedCode });
  } catch (error: any) {
    console.error("❌ Error in edit-element route:", error);
    return NextResponse.json(
      { error: error.message || "Failed to edit element" },
      { status: 500 }
    );
  }
}
