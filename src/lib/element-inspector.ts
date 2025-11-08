/**
 * Element Inspector Script
 * This script is injected into the preview iframe to enable element selection
 */

export const getInspectorScript = () => `
<script>
(function() {
  let isInspectorActive = false;
  let selectedElement = null;
  let highlightBox = null;
  
  // Create highlight overlay
  function createHighlightBox() {
    const box = document.createElement('div');
    box.id = 'element-inspector-highlight';
    box.style.cssText = \`
      position: absolute;
      border: 2px solid #3b82f6;
      background: rgba(59, 130, 246, 0.1);
      pointer-events: none;
      z-index: 999999;
      transition: all 0.1s ease;
      box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.3);
    \`;
    document.body.appendChild(box);
    return box;
  }
  
  // Get element position
  function getElementPosition(el) {
    const rect = el.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    
    return {
      top: rect.top + scrollTop,
      left: rect.left + scrollLeft,
      width: rect.width,
      height: rect.height
    };
  }
  
  // Update highlight position
  function updateHighlight(element) {
    if (!highlightBox || !element) return;
    
    const pos = getElementPosition(element);
    highlightBox.style.top = pos.top + 'px';
    highlightBox.style.left = pos.left + 'px';
    highlightBox.style.width = pos.width + 'px';
    highlightBox.style.height = pos.height + 'px';
    highlightBox.style.display = 'block';
  }
  
  // Hide highlight
  function hideHighlight() {
    if (highlightBox) {
      highlightBox.style.display = 'none';
    }
  }
  
  // Get element's outer HTML with proper formatting
  function getElementHTML(element) {
    return element.outerHTML;
  }
  
  // Get element selector path
  function getElementSelector(element) {
    if (element.id) return '#' + element.id;
    if (element.className) {
      const classes = element.className.split(' ').filter(c => c.trim());
      if (classes.length > 0) return element.tagName.toLowerCase() + '.' + classes.join('.');
    }
    return element.tagName.toLowerCase();
  }
  
  // Handle mouse move
  function handleMouseMove(e) {
    if (!isInspectorActive) return;
    
    e.stopPropagation();
    const target = e.target;
    
    // Skip the highlight box itself
    if (target.id === 'element-inspector-highlight') return;
    
    updateHighlight(target);
  }
  
  // Handle click
  function handleClick(e) {
    if (!isInspectorActive) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const target = e.target;
    if (target.id === 'element-inspector-highlight') return;
    
    selectedElement = target;
    
    // Send selection to parent window
    const elementData = {
      html: getElementHTML(target),
      selector: getElementSelector(target),
      tagName: target.tagName.toLowerCase(),
      textContent: target.textContent?.trim().substring(0, 100) || ''
    };
    
    window.parent.postMessage({
      type: 'ELEMENT_SELECTED',
      data: elementData
    }, '*');
    
    // Add selected state to highlight
    if (highlightBox) {
      highlightBox.style.borderColor = '#10b981';
      highlightBox.style.background = 'rgba(16, 185, 129, 0.1)';
    }
  }
  
  // Toggle inspector mode
  function toggleInspector(active) {
    isInspectorActive = active;
    
    if (active) {
      if (!highlightBox) {
        highlightBox = createHighlightBox();
      }
      document.body.style.cursor = 'crosshair';
      document.addEventListener('mousemove', handleMouseMove, true);
      document.addEventListener('click', handleClick, true);
    } else {
      document.body.style.cursor = 'default';
      document.removeEventListener('mousemove', handleMouseMove, true);
      document.removeEventListener('click', handleClick, true);
      hideHighlight();
    }
    
    // Notify parent
    window.parent.postMessage({
      type: 'INSPECTOR_STATE_CHANGED',
      active: active
    }, '*');
  }
  
  // Listen for messages from parent
  window.addEventListener('message', (event) => {
    if (event.data.type === 'TOGGLE_INSPECTOR') {
      toggleInspector(event.data.active);
    }
    
    if (event.data.type === 'DESELECT_ELEMENT') {
      selectedElement = null;
      hideHighlight();
      if (highlightBox) {
        highlightBox.style.borderColor = '#3b82f6';
        highlightBox.style.background = 'rgba(59, 130, 246, 0.1)';
      }
    }
  });
  
  // Notify parent that inspector is ready
  window.parent.postMessage({ type: 'INSPECTOR_READY' }, '*');
})();
</script>
`;
