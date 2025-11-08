"use client";

import { useState } from "react";
import { Tldraw, Editor, TLUiOverrides } from "tldraw";
import { Button } from "@/components/ui/button";
import { Sparkles, Maximize2, Minimize2 } from "lucide-react";
import "tldraw/tldraw.css";

interface DrawingCanvasProps {
  onGenerate: (canvasData: string) => void;
  isGenerating: boolean;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

export function DrawingCanvas({
  onGenerate,
  isGenerating,
  isFullscreen,
  onToggleFullscreen,
}: DrawingCanvasProps) {
  const [editor, setEditor] = useState<Editor | null>(null);

  const handleGenerate = async () => {
    if (!editor) return;

    try {
      // Get all shapes from the canvas
      const shapes = editor.getCurrentPageShapes();

      if (shapes.length === 0) {
        alert("Please draw something on the canvas first!");
        return;
      }

      // Export the canvas as SVG and convert to image
      const svg = await editor.getSvgString(
        Array.from(editor.getCurrentPageShapeIds())
      );

      if (!svg) {
        throw new Error("Failed to export canvas");
      }

      // Convert SVG to data URL
      const svgBlob = new Blob([svg.svg], { type: "image/svg+xml" });
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result as string;
        onGenerate(base64data);
      };
      reader.readAsDataURL(svgBlob);
    } catch (error) {
      console.error("Error exporting canvas:", error);
      alert("Failed to export canvas. Please try again.");
    }
  };

  return (
    <div className="h-full flex flex-col bg-card rounded-lg border border-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-card border-b border-border">
        <h2 className="text-sm font-semibold text-foreground">Canvas</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleFullscreen}
          className="h-8 w-8"
        >
          {isFullscreen ? (
            <Minimize2 className="h-4 w-4" />
          ) : (
            <Maximize2 className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative">
        <Tldraw
          onMount={(editor) => setEditor(editor)}
          autoFocus
        />
      </div>

      {/* Generate Button */}
      <div className="p-4 bg-card border-t border-border">
        <Button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full bg-gradient-primary text-white hover:opacity-90 transition-opacity"
          size="lg"
        >
          {isGenerating ? (
            <>
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Website
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
