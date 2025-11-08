import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY || "",
});

const SYSTEM_PROMPT = `
You are an expert frontend developer specializing in HTML, CSS, and modern web design.
Your task is to analyze the provided screenshot of a website sketch and generate the corresponding HTML page.

Rules:
1. **Output ONLY a complete HTML document.** Start with <!DOCTYPE html> and include all necessary tags.
2. **Use Tailwind CSS** (loaded from CDN) for all styling. Try to match the layout, spacing, and visual hierarchy of the sketch as closely as possible.
3. **Use placeholder images** (e.g., \`https://placehold.co/600x400\`) for any image rectangles in the sketch.
4. **Use meaningful placeholder text** (Lorem Ipsum) for text areas.
5. **Complete HTML Document:** Include proper <head> with meta tags, Tailwind CSS CDN, and any necessary styles.
6. **Responsive Design:** Make it mobile-friendly with proper viewport settings.
7. **Interactive Elements:** Style buttons, links, and inputs to look interactive and functional.
8. **Include inline JavaScript** if needed for basic interactivity (like modals, dropdowns, etc.)
9. **Do NOT include any markdown code fences** or explanatory text - just the HTML.

Now, generate the complete HTML page for this sketch.
`;

// Next.js 16 App Router - increase body size limit
export const runtime = 'nodejs';
export const maxDuration = 60; // Maximum function duration in seconds

interface GenerateRequestBody {
  imageBase64: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: GenerateRequestBody = await req.json();
    const { imageBase64 } = body;

    if (!imageBase64) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      );
    }

    // Extract mime type and base64 data properly
    const mimeTypeMatch = imageBase64.match(/^data:([^;]+);base64,/);
    const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : "image/png";
    
    // Remove the data URI prefix completely (handles both image/png and image/svg+xml)
    const base64Data = imageBase64.replace(/^data:[^;]+;base64,/, "");

    console.log("🤖 Calling Gemini API...");
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          inlineData: {
            mimeType: mimeType,
            data: base64Data,
          },
        },
        { text: SYSTEM_PROMPT },
      ],
    });

    const text = response.text;
    console.log("✅ Gemini responded!");

    if (!text) {
      throw new Error("No response text from Gemini");
    }

    let cleanCode = text;
    
    // Remove markdown code fences if present
    const codeBlockRegex = /```(?:html)?\n?([\s\S]*?)```/;
    const match = text.match(codeBlockRegex);

    if (match && match[1]) {
      cleanCode = match[1].trim();
      console.log("🧹 Cleaned up markdown formatting.");
    } else {
      cleanCode = text.trim();
      console.log("⚠️ No markdown fences found, using raw output.");
    }

    if (!cleanCode.toLowerCase().includes('<!doctype html>')) {
      console.warn("🚨 Warning: Generated code might not be a valid HTML document.");
    }

    // Send success response
    return NextResponse.json({ code: cleanCode }, { status: 200 });

  } catch (error) {
    console.error("❌ Generative AI Error:", error);
    
    return NextResponse.json(
      { error: 'Failed to generate code. The AI might be busy or the image is too complex.' },
      { status: 500 }
    );
  }
}
