export function getLivePreviewFrame(reactCode: string): string {
  
  let safeCode = reactCode.replace(/export default function\s*\(/, 'export default function App(');

  safeCode = safeCode.replace('export default function', 'function');


  safeCode = safeCode.replace(/^(import .*)/gm, '// $1');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { margin: 0; padding: 0; }
    /* Simple spinner for iframe loading state if needed */
    .loading { display: flex; justify-content: center; align-items: center; height: 100vh; font-family: sans-serif; color: #666; }
  </style>
</head>
<body>
  <div id="root"></div>

  <script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>

  <script type="text/babel" data-presets="react">
    // We need to ensure React is available globally for JSX to work
    window.React = React;

    // --- A basic error boundary to catch runtime errors in the user's code ---
    class ErrorBoundary extends React.Component {
      constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
      }
      static getDerivedStateFromError(error) {
        return { hasError: true, error };
      }
      render() {
        if (this.state.hasError) {
          return (
            <div style={{ padding: 20, color: 'red', fontFamily: 'monospace' }}>
              <h3>Preview Error:</h3>
              <pre>{this.state.error?.message}</pre>
            </div>
          );
        }
        return this.props.children;
      }
    }

    try {
      // --- INJECTED USER CODE STARTS HERE ---
      ${safeCode}
      // --- INJECTED USER CODE ENDS HERE ---

      // Attempt to find the main component to render
      let MainComponent = null;
      if (typeof Page !== 'undefined') MainComponent = Page;
      else if (typeof App !== 'undefined') MainComponent = App;
      else if (typeof GeneratedComponent !== 'undefined') MainComponent = GeneratedComponent;
      // Fallback: try to find the *last* function defined if standard names fail
      // (This is a rough hack if you want to get fancier later)

      const root = ReactDOM.createRoot(document.getElementById('root'));
      if (MainComponent) {
        root.render(
          <ErrorBoundary>
            <MainComponent />
          </ErrorBoundary>
        );
      } else {
        // If no component is found, show a helpful message in the preview
        document.getElementById('root').innerHTML = \`
          <div style="padding: 20px; font-family: sans-serif; color: #ef4444;">
            <strong>Render Error:</strong> Could not find a component named 'App', 'Page', or 'GeneratedComponent'.
            <br/><br/>
            Did the AI generate a valid React component function?
          </div>
        \`;
      }
    } catch (err) {
      // Catches syntax errors in the injected code before React even runs
      document.getElementById('root').innerHTML = \`
        <div style="padding: 20px; color: #ef4444; font-family: monospace;">
          <strong>Syntax Error:</strong> \${err.message}
        </div>
      \`;
      console.error("Preview Runtime Error:", err);
    }
  </script>
</body>
</html>
  `;
}