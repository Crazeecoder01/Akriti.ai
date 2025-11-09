"use client";

import { useState } from "react";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { DrawingCanvas } from "@/components/DrawingCanvas";
import Aurora from "@/components/Aurora";
import { PreviewPanel, SelectedElement } from "@/components/PreviewPanel";
import { ElementEditor } from "@/components/ElementEditor";
import { toast } from "sonner";

export default function Home() {
  const [htmlCode, setHtmlCode] = useState("");
  const [canvasData, setCanvasData] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [canvasFullscreen, setCanvasFullscreen] = useState(false);
  const [previewFullscreen, setPreviewFullscreen] = useState(false);
  const [isEditorFocused, setIsEditorFocused] = useState(false);

  // Element editing state
  const [selectedElement, setSelectedElement] = useState<SelectedElement | null>(null);
  const [isEditingElement, setIsEditingElement] = useState(false);

  const handleCodeChange = (newCode: string) => {
    setHtmlCode(newCode);
  };

  const handleEditorFocusChange = (isFocused: boolean) => {
    setIsEditorFocused(isFocused);
  };

  const handleGenerate = async (currentCanvasData: string, previousCanvasData?: string) => {
    setIsGenerating(true);
    setCanvasData(currentCanvasData); // Store current canvas data for refinement
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64: currentCanvasData,
          previousImageBase64: previousCanvasData,
          previousCode: htmlCode || undefined,
          prompt: prompt.trim() || undefined
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate code');
      }

      const data = await response.json();
      setHtmlCode(data.code); // Store HTML code for refinement and preview
      toast.success("Website generated successfully!");
    } catch (error) {
      toast.error("Failed to generate website");
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleElementSelected = (element: SelectedElement) => {
    setSelectedElement(element);
  };

  const handleCloseElementEditor = () => {
    setSelectedElement(null);
  };

  const handleApplyElementEdit = async (userPrompt: string) => {
    if (!selectedElement || !htmlCode) return;

    setIsEditingElement(true);
    try {
      const response = await fetch('/api/edit-element', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          previousCode: htmlCode,
          selectedElementHTML: selectedElement.html,
          userPrompt: userPrompt,
          imageBase64: canvasData || undefined, // Optional context
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to edit element');
      }

      const data = await response.json();
      setHtmlCode(data.code);
      setSelectedElement(null);
      toast.success("Element updated successfully!");
    } catch (error) {
      toast.error("Failed to update element");
      console.error(error);
    } finally {
      setIsEditingElement(false);
    }
  };

  // Commented out as we're using single button approach that handles both generation and updates
  /*const handleRefine = async (refinement: string) => {
    if (!canvasData || !htmlCode) {
      toast.error("Please generate a website first");
      return;
    }

    setIsUpdating(true);
    try {
      const response = await fetch('/api/refine', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64: canvasData,
          previousCode: htmlCode,
          userPrompt: refinement,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to refine code');
      }

      const data = await response.json();
      setHtmlCode(data.code); // Update HTML code

      toast.success("Website updated!");
    } catch (error) {
      toast.error("Failed to update website");
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };*/

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="relative h-16 overflow-hidden">
        <div className="absolute inset-0">
          <Aurora
            colorStops={["#3A29FF", "#FF94B4", "#FF3232"]}
            blend={0.5}
            amplitude={1.0}
            speed={0.5}
          />
        </div>
        <div className="container mx-auto px-6 py-3 relative z-10">
          <h1 className="text-xl font-bold text-white drop-shadow-lg">
            Akriti.ai
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 p-3 overflow-hidden">
        {canvasFullscreen || previewFullscreen ? (
          <div className="h-full">
            {canvasFullscreen && (
              <div className="flex flex-col h-full gap-3">
                <div className="flex-1">
                  <DrawingCanvas
                    onGenerate={handleGenerate}
                    isGenerating={isGenerating}
                    isFullscreen={canvasFullscreen}
                    onToggleFullscreen={() => setCanvasFullscreen(false)}
                    disableShortcuts={isEditorFocused}
                  />
                </div>
                <div className="w-full px-4 pb-4">
                  <textarea
                    placeholder="Describe any specific requirements for your website..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="w-full p-3 h-24 rounded-lg border border-border bg-card text-sm resize-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
            )}
            {previewFullscreen && (
              <PreviewPanel
                htmlCode={htmlCode}
                isLoading={isGenerating}
                isFullscreen={previewFullscreen}
                onToggleFullscreen={() => setPreviewFullscreen(false)}
                onElementSelected={handleElementSelected}
                onCodeChange={handleCodeChange}
                onEditorFocusChange={handleEditorFocusChange}
              />
            )}
          </div>
        ) : (
          <ResizablePanelGroup direction="horizontal" className="h-full gap-3">
            <ResizablePanel defaultSize={45} minSize={30}>
              <div className="flex flex-col h-full gap-3">
                <div className="flex-1">
                  <DrawingCanvas
                    onGenerate={handleGenerate}
                    isGenerating={isGenerating}
                    isFullscreen={canvasFullscreen}
                    onToggleFullscreen={() => setCanvasFullscreen(true)}
                    disableShortcuts={isEditorFocused}
                  />
                </div>
                {/* Prompt Input */}
                <div className="w-full px-4 pb-4">
                  <textarea
                    placeholder="Describe any specific requirements for your website..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="w-full p-3 h-24 rounded-lg border border-border bg-card text-sm resize-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
            </ResizablePanel>

            <ResizableHandle className="w-px bg-border hover:bg-primary/50 transition-colors" />

            <ResizablePanel defaultSize={55} minSize={30}>
              <div className="relative h-full">
                <PreviewPanel
                  htmlCode={htmlCode}
                  isLoading={isGenerating}
                  isFullscreen={previewFullscreen}
                  onToggleFullscreen={() => setPreviewFullscreen(true)}
                  onElementSelected={handleElementSelected}
                  onCodeChange={handleCodeChange}
                  onEditorFocusChange={handleEditorFocusChange}
                />

                {/* Element Editor Overlay */}
                {selectedElement && (
                  <ElementEditor
                    selectedElement={selectedElement}
                    onClose={handleCloseElementEditor}
                    onApplyEdit={handleApplyElementEdit}
                    isEditing={isEditingElement}
                  />
                )}
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        )}
      </div>

      {/* Refine Panel - Commented out as we're using single button approach
      {!canvasFullscreen && !previewFullscreen && (
        <RefinePanel onRefine={handleRefine} isUpdating={isUpdating} />
      )} */}
    </div>
  );
}
