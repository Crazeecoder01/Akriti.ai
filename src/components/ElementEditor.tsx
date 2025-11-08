"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { X, Sparkles, Loader2 } from "lucide-react";
import { SelectedElement } from "./PreviewPanel";

interface ElementEditorProps {
  selectedElement: SelectedElement | null;
  onClose: () => void;
  onApplyEdit: (prompt: string) => Promise<void>;
  isEditing: boolean;
}

export function ElementEditor({
  selectedElement,
  onClose,
  onApplyEdit,
  isEditing,
}: ElementEditorProps) {
  const [prompt, setPrompt] = useState("");

  if (!selectedElement) return null;

  const handleApply = async () => {
    if (!prompt.trim()) return;
    await onApplyEdit(prompt);
    setPrompt("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleApply();
    }
  };

  return (
    <Card className="absolute bottom-4 right-4 w-96 max-w-[calc(100%-2rem)] bg-background/95 backdrop-blur-sm border-2 shadow-xl z-50">
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-sm">Edit Element</h3>
            </div>
            <p className="text-xs text-muted-foreground">
              Selected: <span className="font-mono">{selectedElement.tagName}</span>
            </p>
            {selectedElement.textContent && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                "{selectedElement.textContent}"
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-6 w-6 -mr-2 -mt-1"
            disabled={isEditing}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Selected Element Preview */}
        <div className="bg-muted/50 rounded-md p-2 max-h-24 overflow-auto">
          <pre className="text-xs font-mono text-muted-foreground overflow-x-auto">
            {selectedElement.html.substring(0, 200)}
            {selectedElement.html.length > 200 && "..."}
          </pre>
        </div>

        {/* Prompt Input */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            What would you like to change?
          </label>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g., Change the button color to blue, make the text larger, add an icon..."
            className="min-h-[80px] text-sm resize-none"
            disabled={isEditing}
          />
          <p className="text-xs text-muted-foreground">
            Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Ctrl/Cmd + Enter</kbd> to apply
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            onClick={handleApply}
            disabled={!prompt.trim() || isEditing}
            className="flex-1"
            size="sm"
          >
            {isEditing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Applying...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Apply Changes
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isEditing}
            size="sm"
          >
            Cancel
          </Button>
        </div>
      </div>
    </Card>
  );
}
