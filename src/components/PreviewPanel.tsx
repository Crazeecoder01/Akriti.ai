"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Code2, Eye, Maximize2, Minimize2, Loader2, Copy, Check, MousePointerClick } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { toast } from "sonner";
import { getInspectorScript } from "@/lib/element-inspector";

export interface SelectedElement {
  html: string;
  selector: string;
  tagName: string;
  textContent: string;
}

interface PreviewPanelProps {
  htmlCode: string;
  isLoading: boolean;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onElementSelected?: (element: SelectedElement) => void;
}

export function PreviewPanel({
  htmlCode,
  isLoading,
  isFullscreen,
  onToggleFullscreen,
  onElementSelected,
}: PreviewPanelProps) {
  const [showCode, setShowCode] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isInspectorActive, setIsInspectorActive] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Inject inspector script into HTML
  const getEnhancedHtml = (html: string) => {
    if (!html) return html;
    
    const inspectorScript = getInspectorScript();
    
    // Inject before closing body tag, or at the end if no body tag
    if (html.includes('</body>')) {
      return html.replace('</body>', `${inspectorScript}</body>`);
    } else {
      return html + inspectorScript;
    }
  };

  // Handle messages from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'ELEMENT_SELECTED') {
        if (onElementSelected) {
          onElementSelected(event.data.data);
          toast.success("Element selected!");
        }
      }
      
      if (event.data.type === 'INSPECTOR_STATE_CHANGED') {
        setIsInspectorActive(event.data.active);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onElementSelected]);

  // Toggle inspector mode
  const toggleInspector = () => {
    if (iframeRef.current?.contentWindow) {
      const newState = !isInspectorActive;
      iframeRef.current.contentWindow.postMessage({
        type: 'TOGGLE_INSPECTOR',
        active: newState
      }, '*');
    }
  };

  const handleCopy = async () => {
    if (!htmlCode) return;
    
    try {
      await navigator.clipboard.writeText(htmlCode);
      setIsCopied(true);
      toast.success("Code copied to clipboard!");
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy code");
    }
  };

  return (
    <div className="h-full flex flex-col bg-card rounded-lg border border-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-card border-b border-border">
        <h2 className="text-sm font-semibold text-foreground">Preview</h2>
        <div className="flex items-center gap-2">
          <Button
            variant={isInspectorActive ? "default" : "ghost"}
            size="icon"
            onClick={toggleInspector}
            className="h-8 w-8"
            disabled={!htmlCode || showCode}
            title="Select Element"
          >
            <MousePointerClick className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCopy}
            className="h-8 w-8"
            disabled={!htmlCode}
          >
            {isCopied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
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
            ref={iframeRef}
            srcDoc={getEnhancedHtml(htmlCode)}
            className="w-full h-full border-0 bg-white"
            title="Website Preview"
            sandbox="allow-scripts allow-same-origin allow-forms"
          />
        )}
      </div>
    </div>
  );
}
