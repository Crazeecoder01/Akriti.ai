"use client";

import { useState, useRef } from "react";
import { Tldraw, Editor, TLRecord } from "tldraw";
import { Button } from "@/components/ui/button";
import { Sparkles, Maximize2, Minimize2 } from "lucide-react";
import "tldraw/tldraw.css";

interface DrawingCanvasProps {
  onGenerate: (canvasData: string) => void;
  isGenerating: boolean;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

// Store canvas state outside component to persist across remounts
let persistedSnapshot: TLRecord[] | null = null;

export function DrawingCanvas({
  onGenerate,
  isGenerating,
  isFullscreen,
  onToggleFullscreen,
}: DrawingCanvasProps) {
  const [editor, setEditor] = useState<Editor | null>(null);

  const handleGenerate = async () => {
    if (!editor) return;

    // Save current state before generating
    try {
      persistedSnapshot = editor.store.allRecords();
    } catch (error) {
      console.error('Error saving canvas state:', error);
    }

    try {
      // Get all shapes from the canvas
      const shapes = editor.getCurrentPageShapes();

      if (shapes.length === 0) {
        alert("Please draw something on the canvas first!");
        return;
      }

      // Export the canvas as png and convert to image
      const png = await editor.toImage(shapes, {
        background: true,
        format: "png",
        scale: 2
      })

      if (!png) {
        throw new Error("Failed to export canvas");
      }

      // Convert png blob to data URL
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result as string;
        onGenerate(base64data);
      };
      reader.readAsDataURL(png.blob);
    } catch (error) {
      console.error("Error exporting canvas:", error);
      alert("Failed to export canvas. Please try again.");
    }
  };

  const handleToggleFullscreen = () => {
    // Save current state before toggling
    if (editor) {
      try {
        persistedSnapshot = editor.store.allRecords();
      } catch (error) {
        console.error('Error saving canvas state:', error);
      }
    }
    onToggleFullscreen();
  };

  return (
    <div className="h-full flex flex-col bg-card rounded-lg border border-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-card border-b border-border">
        <h2 className="text-sm font-semibold text-foreground">Canvas</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleToggleFullscreen}
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
          onMount={(editor) => {
            setEditor(editor);
            // Restore the previous state if it exists
            if (persistedSnapshot && persistedSnapshot.length > 0) {
              try {
                editor.store.put(persistedSnapshot);
              } catch (error) {
                console.error('Error restoring canvas state:', error);
              }
            }
          }}
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
