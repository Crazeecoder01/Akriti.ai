"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Loader2 } from "lucide-react";

interface RefinePanelProps {
  onRefine: (refinement: string) => void;
  isUpdating: boolean;
}

export function RefinePanel({ onRefine, isUpdating }: RefinePanelProps) {
  const [refinement, setRefinement] = useState("");

  const handleSubmit = () => {
    if (refinement.trim()) {
      onRefine(refinement);
      setRefinement("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleSubmit();
    }
  };

  return (
    <div className="bg-card border-t border-border">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <Textarea
              placeholder="Describe changes you'd like to make..."
              value={refinement}
              onChange={(e) => setRefinement(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isUpdating}
              className="min-h-[60px] max-h-[120px] resize-none bg-background border-border focus:ring-2 focus:ring-primary/20"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Press{" "}
              <kbd className="px-1.5 py-0.5 text-xs font-semibold bg-muted rounded">
                Ctrl
              </kbd>{" "}
              +{" "}
              <kbd className="px-1.5 py-0.5 text-xs font-semibold bg-muted rounded">
                Enter
              </kbd>{" "}
              to update
            </p>
          </div>
          <Button
            onClick={handleSubmit}
            disabled={isUpdating || !refinement.trim()}
            className="bg-gradient-primary text-white hover:opacity-90 transition-opacity self-start"
            size="lg"
          >
            {isUpdating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Update
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
