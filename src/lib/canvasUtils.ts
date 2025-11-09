interface TLDrawShape {
  id: string;
  type: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  text?: string;
}

interface TLDrawData {
  shapes?: TLDrawShape[];
}

export interface CanvasChange {
  type: 'addition' | 'removal' | 'modification';
  element: string;
  location: string;
  details?: {
    previousValue?: string;
    newValue?: string;
    position?: { x: number; y: number };
  };
}

/**
 * Detects changes between two TLDraw canvas states by comparing base64 encoded data
 * @param previousCanvas - Base64 encoded string of the previous canvas state
 * @param currentCanvas - Base64 encoded string of the current canvas state
 * @returns Array of CanvasChange objects describing additions, removals, and modifications
 */
export function detectCanvasChanges(
  previousCanvas: string, 
  currentCanvas: string
): CanvasChange[] {
  const changes: CanvasChange[] = [];
  
  try {
    // Extract the actual base64 data after the comma
    const prevBase64 = previousCanvas.split(',')[1];
    const currBase64 = currentCanvas.split(',')[1];
    
    // Decode base64 to get the actual TLDraw data
    const prevData = JSON.parse(atob(prevBase64));
    const currData = JSON.parse(atob(currBase64));
    
    // Compare shapes
    const prevShapes = new Set(prevData.shapes?.map((s: TLDrawShape) => s.id));
    const currShapes = new Set(currData.shapes?.map((s: TLDrawShape) => s.id));
    
    // Find new shapes
    currData.shapes?.forEach((shape: TLDrawShape) => {
      if (!prevShapes.has(shape.id)) {
        changes.push({
          type: 'addition',
          element: shape.type,
          location: `x: ${shape.x}, y: ${shape.y}`,
          details: {
            position: { x: shape.x, y: shape.y }
          }
        });
      }
    });

    // Find removed shapes
    prevData.shapes?.forEach((shape: TLDrawShape) => {
      if (!currShapes.has(shape.id)) {
        changes.push({
          type: 'removal',
          element: shape.type,
          location: `x: ${shape.x}, y: ${shape.y}`
        });
      }
    });

    // Detect modifications to existing shapes
    currData.shapes?.forEach((currShape: TLDrawShape) => {
      const prevShape = prevData.shapes?.find((s: TLDrawShape) => s.id === currShape.id);
      if (prevShape) {
        // Always track text changes, even if position hasn't changed
        if (prevShape.text !== currShape.text) {
          changes.push({
            type: 'modification',
            element: 'text',  // Specifically mark as text change
            location: `x: ${currShape.x}, y: ${currShape.y}`,
            details: {
              previousValue: prevShape.text || '',  // Ensure we have a value
              newValue: currShape.text || '',      // Ensure we have a value
              position: { x: currShape.x, y: currShape.y }
            }
          });
        }
        // Check for position/size changes separately
        else if (
          prevShape.x !== currShape.x || 
          prevShape.y !== currShape.y ||
          prevShape.width !== currShape.width ||
          prevShape.height !== currShape.height
        ) {
          changes.push({
            type: 'modification',
            element: currShape.type,
            location: `x: ${currShape.x}, y: ${currShape.y}`,
            details: {
              position: { x: currShape.x, y: currShape.y }
            }
          });
        }
      }
    });

  } catch (error) {
    console.error('Error detecting canvas changes:', error);
  }

  return changes;
}