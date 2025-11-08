"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Code2, Eye, Maximize2, Minimize2, Loader2 } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

interface PreviewPanelProps {
  htmlCode: string;
  isLoading: boolean;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

export function PreviewPanel({
  htmlCode,
  isLoading,
  isFullscreen,
  onToggleFullscreen,
}: PreviewPanelProps) {
  const [showCode, setShowCode] = useState(false);

  return (
    <div className="h-full flex flex-col bg-card rounded-lg border border-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-card border-b border-border">
        <h2 className="text-sm font-semibold text-foreground">Preview</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowCode(!showCode)}
            className="h-8 w-8"
            disabled={!htmlCode}
          >
            {showCode ? (
              <Eye className="h-4 w-4" />
            ) : (
              <Code2 className="h-4 w-4" />
            )}
          </Button>
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
      </div>

      {/* Content */}
      <div className="flex-1 relative overflow-hidden bg-muted/30">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground animate-pulse-slow">
                Generating your website...
              </p>
            </div>
          </div>
        ) : !htmlCode ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
            <div className="max-w-md">
              <h3 className="text-2xl font-bold mb-2 gradient-text">
                Draw and Generate
              </h3>
              <p className="text-muted-foreground">
                Your website preview will appear here
              </p>
            </div>
          </div>
        ) : showCode ? (
          <div className="h-full overflow-auto">
            <SyntaxHighlighter
              language="html"
              style={vscDarkPlus}
              customStyle={{
                margin: 0,
                height: "100%",
                fontSize: "14px",
              }}
              showLineNumbers
            >
              {htmlCode}
            </SyntaxHighlighter>
          </div>
        ) : (
          <iframe
            srcDoc={htmlCode}
            className="w-full h-full border-0 bg-white"
            title="Website Preview"
            sandbox="allow-scripts allow-same-origin allow-forms"
          />
        )}
      </div>
    </div>
  );
}
