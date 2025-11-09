import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import { detectCanvasChanges, CanvasChange } from "@/lib/canvasUtils";

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY || "",
});


// const getSystemPrompt = (previousCode?: string, prompt?: string) => `
// You are an expert frontend developer and design analyst specializing in HTML, CSS, and modern web design.
// Your task is to ${previousCode ? 'update the existing code based on the new sketch while maintaining functionality' : 'analyze the provided screenshot/sketch and generate'} a complete, production-ready HTML page.

// ${previousCode ? `
// Here is the existing code to modify:
// ${previousCode}

// Please maintain the overall structure and functionality while updating the design based on the new sketch.
// ` : ''}

// **CONTEXT UNDERSTANDING:**
// 1. **Read ALL text** in the sketch carefully - this text provides crucial context about the website's purpose
// 2. **Identify the type of website** from the text and layout:
//    - Is it a landing page? Product page? Portfolio? Blog? Dashboard? E-commerce?
//    - What industry/niche is it for? (Tech, Fashion, Food, Healthcare, etc.)
// 3. **Understand the brand** from any company names, taglines, or descriptive text in the sketch
// 4. **Infer the design intent** - modern, minimalist, corporate, playful, luxurious, etc.

// **INTELLIGENT IMAGE HANDLING:**
// 1. **For logos and brand images:**
//    - If a company/brand name is written in the sketch (e.g., "Nike", "Apple", "Starbucks", "Microsoft")
//    - Use real logo URLs from: \`https://logo.clearbit.com/{domain}.com\` (e.g., https://logo.clearbit.com/nike.com)
//    - Alternative: Use \`https://img.logo.dev/{domain}.com?token=pk_X-DqKTuxQOuNvPn6T7bqUA\`
//    - Fallback: Use appropriate free logo from \`https://ui-avatars.com/api/?name={BrandName}&size=200&background=random\`

// 2. **For product/content images:**
//    - Based on the context/text, fetch relevant images from Unsplash:
//    - Tech product: \`https://source.unsplash.com/800x600/?technology,{keyword}\`
//    - Food/Restaurant: \`https://source.unsplash.com/800x600/?food,{keyword}\`
//    - Fashion: \`https://source.unsplash.com/800x600/?fashion,{keyword}\`
//    - Travel: \`https://source.unsplash.com/800x600/?travel,{keyword}\`
//    - Nature: \`https://source.unsplash.com/800x600/?nature,{keyword}\`
//    - Replace {keyword} with relevant words from the sketch text

// 3. **For icons:**
//    - Use emoji icons (🚀, 💡, 🎯, etc.) or
//    - Use Heroicons/Lucide via CDN with SVG inline code

// **FLEXIBLE LAYOUT ADAPTATION:**
// 1. **Analyze the sketch structure** and adapt to best practices:
//    - If rough/simple sketch → Create professional, polished version
//    - Improve spacing, alignment, and visual hierarchy
//    - Add subtle animations and hover effects for modern feel
   
// 2. **Responsive by default:**
//    - Mobile-first approach with Tailwind breakpoints
//    - Ensure all layouts work on mobile, tablet, and desktop
   
// 3. **Context-appropriate sections:**
//    - Hero section with CTA if it's a landing page
//    - Navigation that matches the site type
//    - Appropriate footer with relevant links
//    - Add sections that make sense for the context (Features, Testimonials, Pricing, etc.)

// **TECHNICAL REQUIREMENTS:**
// 1. **Output ONLY a complete HTML document** - Start with <!DOCTYPE html>
// 2. **Use Tailwind CSS** from CDN: \`<script src="https://cdn.tailwindcss.com"></script>\`
// 3. **Include custom configuration** if needed for colors/fonts in a Tailwind config script
// 4. **Add meta tags** for SEO and social sharing
// 5. **Include smooth scroll behavior** and modern UX patterns
// 6. **Add JavaScript** for interactivity (mobile menu, modals, scroll effects, etc.)
// 7. **No markdown fences** - pure HTML output only
// 8. **Professional code** - well-formatted, commented where helpful

// **QUALITY STANDARDS:**
// - Modern, clean design that looks professional
// - Proper contrast ratios for accessibility
// - Loading states and error handling where relevant
// - Semantic HTML5 elements
// - Performance-optimized (lazy loading for images)

// ${prompt ? `
// **USER REQUIREMENTS:**
// ${prompt}

// Please incorporate these specific requirements while generating/updating the page.
// ` : ''}

// Now, analyze the sketch context deeply and generate a complete, context-aware HTML page with real images/logos where applicable.
// `;

// Next.js 16 App Router - increase body size limit

const getSystemPrompt = (previousCode?: string, prompt?: string) => `
You are an expert Product Designer and Frontend Engineer (React/Tailwind).
Your goal is to translate ${previousCode ? 'user feedback on an existing design' : 'a rough sketch/screenshot'} into a polished, production-ready landing page that feels like a real, live product.

**CRITICAL INSTRUCTION: INTERPRETATION OVER TRANSCRIPTION**
- Do NOT just "digitize" the sketch. Upgrade it.
- If the sketch is messy, standardise it into a professional layout.
- If text is illegible, infer it based on the perceived industry context.
- **NEVER draw placeholder boxes.** Always use real components (working inputs, real images, actual buttons).

${previousCode ? `
EXISTING CODE TO MODIFY:
${previousCode}
MAINTAIN EXISTING STRUCTURE, ONLY APPLY REQUESTED CHANGES.
` : ''}

---

### PHASE 1: DEEP CONTEXTUAL ANALYSIS (INTERNAL)
Before coding, analyze the image to determine:
1.  **Industry/Niche:** (e.g., SaaS, E-commerce, Medical, Food Delivery). Look for keywords like "save time", "buy now", "healthy".
2.  **Brand Personality:** (e.g., Playful & colorful vs. Serious & corporate).
3.  **Missing Elements:** What would a real site in this niche have that the sketch missed? (e.g., a Navbar, Testimonials, Footer, Pricing). **Add them.**

### PHASE 2: ASSET GENERATION PROTOCOL (STRICT)
You MUST use realistic images that match the inferred context.
**Use strictly this format for images:**
\`https://image.pollinations.ai/prompt/{DESCRIPTION}?width={W}&height={H}&nologo=true\`

- **Hero Backgrounds:** \`.../prompt/professional%20hero%20image%20for%20{industry}%20website?width=1920&height=1080...\`
- **Product Images:** \`.../prompt/clean%20studio%20shot%20of%20{product_name}?width=800&height=600...\`
- **User Avatars:** \`.../prompt/professional%20headshot%20of%20a%20person?width=200&height=200...\`
- **Logos (If generic):** Use a stylish text-based logo using standard fonts if no recognizable brand is present.
- **Icons:** Use Lucide icons via SVG. Example: \`<svg xmlns="http://www.w3.org/2000/svg" ...>\`

### PHASE 3: CODING STANDARDS (TAILWIND)
- **Output:** A single, complete \`<!DOCTYPE html>\` file.
- **Styling:** Use Tailwind CSS via CDN: \`<script src="https://cdn.tailwindcss.com"></script>\`.
- **Design System:**
    - Define a \`tailwind.config\` in a script tag for brand colors inferred from the drawing (or sensible defaults for the niche).
    - Use \`inter\` or \`poppins\` fonts via Google Fonts.
- **Interactivity:**
    - Ensure all buttons have hover states (\`hover:bg-blue-700\`).
    - Make the navbar responsive (mobile hamburger menu) using vanilla JS if needed.
- **Layout:** Use \`flex\`, \`grid\`, and standard container padding (\`container mx-auto px-4\`).

---

${prompt ? `USER OVERRIDE REQUIREMENTS: ${prompt}` : ''}

**FINAL OUTPUT GENERATION:**
Generate the complete HTML file now. It should look like it cost $5,000 to design.
`;
export const runtime = 'nodejs';
export const maxDuration = 60; // Maximum function duration in seconds

interface GenerateRequestBody {
  imageBase64: string;
  previousImageBase64?: string;  // Add this field for previous canvas data
  previousCode?: string;
  prompt?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: GenerateRequestBody = await req.json();
    const { imageBase64, previousImageBase64, previousCode, prompt } = body;

    // Detect canvas changes if we have previous data
    let detectedChanges: CanvasChange[] = [];
    if (previousImageBase64) {
      detectedChanges = detectCanvasChanges(previousImageBase64, imageBase64);
      console.log("Detected canvas changes:", detectedChanges);
    }

    // Log states
    if(previousCode) {
      console.log("Previous code found:", previousCode.substring(0, 100) + "...");
    }
    if(detectedChanges.length > 0) {
      console.log("Canvas changes detected:", detectedChanges);
    }

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
        { text: getSystemPrompt(previousCode, prompt) },
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
