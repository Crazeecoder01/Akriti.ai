"use client";

import { useState, useRef, useEffect } from "react";
import { Tldraw, Editor, TLRecord } from "tldraw";
import { Button } from "@/components/ui/button";
import { Sparkles, Maximize2, Minimize2, Wand2, Briefcase, Paintbrush } from "lucide-react";
import { detectCanvasChanges } from "@/lib/canvasUtils";
import { GenerationMode } from "@/app/page";
import "tldraw/tldraw.css";

interface DrawingCanvasProps {
  onGenerate: (canvasData: string, prevData?: string) => void;
  isGenerating: boolean;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  disableShortcuts?: boolean;
  mode: GenerationMode;
  onModeChange: (mode: GenerationMode) => void;
}

// Store canvas states outside component to persist across remounts
let persistedSnapshot: TLRecord[] | null = null;
let previousCanvasData: string | null = null;

export function DrawingCanvas({
  onGenerate,
  isGenerating,
  isFullscreen,
  onToggleFullscreen,
  disableShortcuts = false,
  mode,
  onModeChange,
}: DrawingCanvasProps) {
  const [editor, setEditor] = useState<Editor | null>(null);

  // Disable tldraw shortcuts when editor is focused
  useEffect(() => {
    if (!editor) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (disableShortcuts) {
        // Stop propagation to prevent tldraw from receiving keyboard events
        e.stopPropagation();
      }
    };

    if (disableShortcuts) {
      window.addEventListener('keydown', handleKeyDown, true);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [editor, disableShortcuts]);

  const handleGenerate = async () => {
    if (!editor) return;

    try {
      // Get all shapes from the canvas
      const shapes = editor.getCurrentPageShapes();

      if (shapes.length === 0) {
        alert("Please draw something on the canvas first!");
        return;
      }

      // Export the canvas as png and convert to image
      const jpeg = await editor.toImage(shapes, {
        background: true,
        format: "jpeg",
        scale: 2
      })

      if (!jpeg) {
        throw new Error("Failed to export canvas");
      }

      // Convert jpeg blob to data URL
      const reader = new FileReader();
      reader.onloadend = () => {
        const currentCanvasData = reader.result as string;

        // Call onGenerate with both current and previous canvas data
        onGenerate(currentCanvasData, previousCanvasData || undefined);

        // Update previous canvas data for next comparison
        previousCanvasData = currentCanvasData;

        // Save current state after generating
        try {
          persistedSnapshot = editor.store.allRecords();
        } catch (error) {
          console.error('Error saving canvas state:', error);
        }
      };
      reader.readAsDataURL(jpeg.blob);
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
        console.log('Saved canvas state:', persistedSnapshot.length, 'records');
      } catch (error) {
        console.error('Error saving canvas state:', error);
      }
    }
    onToggleFullscreen();
  };

  // Save canvas state when component unmounts
  useEffect(() => {
    return () => {
      if (editor) {
        try {
          persistedSnapshot = editor.store.allRecords();
        } catch (error) {
          console.error('Error saving canvas state on unmount:', error);
        }
      }
    };
  }, [editor]);

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
                // Use setTimeout to ensure editor is fully initialized
                setTimeout(() => {
                  if (persistedSnapshot) {
                    editor.store.put(persistedSnapshot);
                    console.log('Restored canvas state:', persistedSnapshot.length, 'records');
                  }
                }, 50);
              } catch (error) {
                console.error('Error restoring canvas state:', error);
              }
            }
          }}
          autoFocus
        />
      </div>

      {/* Generate Button */}
      <div className="p-4 bg-card border-t border-border space-y-3">
        {/* Mode Selector */}
        <div className="flex gap-2">
          <Button
            variant={mode === "strict" ? "default" : "outline"}
            onClick={() => onModeChange("strict")}
            disabled={isGenerating}
            className="flex-1 text-sm"
            size="sm"
          >
            <Wand2 className="h-3.5 w-3.5 mr-1.5" />
            Strict
          </Button>
          <Button
            variant={mode === "professional" ? "default" : "outline"}
            onClick={() => onModeChange("professional")}
            disabled={isGenerating}
            className="flex-1 text-sm"
            size="sm"
          >
            <Briefcase className="h-3.5 w-3.5 mr-1.5" />
            Professional
          </Button>
          <Button
            variant={mode === "creative" ? "default" : "outline"}
            onClick={() => onModeChange("creative")}
            disabled={isGenerating}
            className="flex-1 text-sm"
            size="sm"
          >
            <Paintbrush className="h-3.5 w-3.5 mr-1.5" />
            Creative
          </Button>
        </div>

        {/* Mode Description */}
        <p className="text-xs text-muted-foreground text-center">
          {mode === "strict"
            ? "Recreates your drawing exactly as-is"
            : mode === "professional"
              ? "Converts sketch to professional website"
              : "Interprets sketch into a creative, polished design"}
        </p>

        {/* Generate Button */}
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
              Generate {mode === "strict" ? "Drawing" : "Website"}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
