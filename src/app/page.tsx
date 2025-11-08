"use client";

import { useState } from "react";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { DrawingCanvas } from "@/components/DrawingCanvas";
import { PreviewPanel } from "@/components/PreviewPanel";
import { RefinePanel } from "@/components/RefinePanel";
import { toast } from "sonner";

export default function Home() {
  const [htmlCode, setHtmlCode] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [canvasFullscreen, setCanvasFullscreen] = useState(false);
  const [previewFullscreen, setPreviewFullscreen] = useState(false);

  const handleGenerate = async (canvasData: string) => {
    setIsGenerating(true);
    try {
      // TODO: Integrate with AI API (Google Gemini or similar)
      // For now, simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const mockHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Generated Website</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }
    .container {
      text-align: center;
      padding: 2rem;
      max-width: 800px;
    }
    h1 {
      font-size: 3rem;
      margin-bottom: 1rem;
      animation: fadeIn 1s ease-in;
    }
    p {
      font-size: 1.25rem;
      opacity: 0.9;
      margin-bottom: 2rem;
    }
    button {
      background: white;
      color: #667eea;
      border: none;
      padding: 1rem 2rem;
      font-size: 1rem;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      transition: transform 0.2s;
    }
    button:hover {
      transform: scale(1.05);
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-20px); }
      to { opacity: 1; transform: translateY(0); }
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Welcome to Your Website</h1>
    <p>This is a beautiful landing page generated from your sketch!</p>
    <button onclick="alert('Button clicked!')">Get Started</button>
  </div>
</body>
</html>`;

      setHtmlCode(mockHTML);
      toast.success("Website generated successfully!");
    } catch (error) {
      toast.error("Failed to generate website");
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRefine = async (refinement: string) => {
    setIsUpdating(true);
    try {
      // TODO: Integrate with AI API for refinement
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success("Website updated!");
    } catch (error) {
      toast.error("Failed to update website");
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border bg-gradient-primary">
        <div className="container mx-auto px-6 py-3">
          <h1 className="text-xl font-bold text-white">
            Akriti.ai
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 p-3 overflow-hidden">
        {canvasFullscreen || previewFullscreen ? (
          <div className="h-full">
            {canvasFullscreen && (
              <DrawingCanvas
                onGenerate={handleGenerate}
                isGenerating={isGenerating}
                isFullscreen={canvasFullscreen}
                onToggleFullscreen={() => setCanvasFullscreen(false)}
              />
            )}
            {previewFullscreen && (
              <PreviewPanel
                htmlCode={htmlCode}
                isLoading={isGenerating || isUpdating}
                isFullscreen={previewFullscreen}
                onToggleFullscreen={() => setPreviewFullscreen(false)}
              />
            )}
          </div>
        ) : (
          <ResizablePanelGroup direction="horizontal" className="h-full gap-3">
            <ResizablePanel defaultSize={45} minSize={30}>
              <DrawingCanvas
                onGenerate={handleGenerate}
                isGenerating={isGenerating}
                isFullscreen={canvasFullscreen}
                onToggleFullscreen={() => setCanvasFullscreen(true)}
              />
            </ResizablePanel>

            <ResizableHandle className="w-px bg-border hover:bg-primary/50 transition-colors" />

            <ResizablePanel defaultSize={55} minSize={30}>
              <PreviewPanel
                htmlCode={htmlCode}
                isLoading={isGenerating || isUpdating}
                isFullscreen={previewFullscreen}
                onToggleFullscreen={() => setPreviewFullscreen(true)}
              />
            </ResizablePanel>
          </ResizablePanelGroup>
        )}
      </div>

      {/* Refine Panel */}
      {!canvasFullscreen && !previewFullscreen && (
        <RefinePanel onRefine={handleRefine} isUpdating={isUpdating} />
      )}
    </div>
  );
}
