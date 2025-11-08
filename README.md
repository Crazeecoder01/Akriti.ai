# Akriti.ai - Sketch to Website in Seconds

![Akriti.ai](https://img.shields.io/badge/Next.js-16.0.1-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19.2.0-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8?style=for-the-badge&logo=tailwind-css)

A modern web application that transforms your sketches into beautiful, functional websites instantly using AI-powered generation.

## ✨ Features

### 🎨 Drawing Canvas
- **Interactive Canvas**: Built with [tldraw](https://tldraw.com/) for smooth, responsive drawing
- **Full Drawing Tools**: Pen, shapes, text, and more
- **Fullscreen Mode**: Expand canvas for detailed sketching
- **Export to AI**: One-click generation from your sketch

### 👁️ Live Preview
- **Real-time Rendering**: Instantly see generated websites
- **Code View Toggle**: Switch between preview and code with `</>` button
- **Syntax Highlighting**: Beautiful code display with syntax highlighting
- **Fullscreen Preview**: Expand preview for detailed inspection

### 🔄 AI Refinement
- **Text-based Updates**: Describe changes you want to make
- **Keyboard Shortcuts**: Press `Ctrl + Enter` to submit refinements
- **Loading States**: Visual feedback during generation and updates
- **Toast Notifications**: Success and error messages

### 🎯 Advanced UI
- **Resizable Panels**: Adjust canvas and preview sizes to your preference
- **Dark Theme**: Modern, eye-friendly dark interface
- **Responsive Design**: Works on all screen sizes
- **Smooth Animations**: Polished loading and transition effects

## 🚀 Getting Started

### Prerequisites
- Node.js 20+ installed
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Crazeecoder01/Akriti.ai.git
cd akriti.ai
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🏗️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui
- **Canvas**: tldraw
- **Code Highlighting**: react-syntax-highlighter
- **Notifications**: Sonner
- **Icons**: Lucide React

## 📁 Project Structure

```
akriti.ai/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout with Toaster
│   │   ├── page.tsx             # Main application page
│   │   └── globals.css          # Global styles and theme
│   ├── components/
│   │   ├── ui/                  # shadcn/ui components
│   │   ├── DrawingCanvas.tsx    # Canvas component with tldraw
│   │   ├── PreviewPanel.tsx     # Preview/code view component
│   │   └── RefinePanel.tsx      # Refinement input component
│   ├── lib/
│   │   └── utils.ts             # Utility functions (cn, etc.)
│   └── types/
│       └── react-syntax-highlighter.d.ts  # Type definitions
├── public/                      # Static assets
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.ts
```

## 🎨 Components Overview

### DrawingCanvas
- Implements tldraw for sketching
- Exports canvas as image data
- Generate button with loading state
- Fullscreen toggle

### PreviewPanel
- Renders HTML in iframe
- Code view with syntax highlighting
- Toggle between preview/code modes
- Loading animation overlay
- Fullscreen support

### RefinePanel
- Text input for refinement requests
- Update button with loading state
- Keyboard shortcut support
- Empty state validation

## 🔧 Configuration

### Tailwind CSS
The application uses Tailwind CSS v4 with custom theme variables defined in `globals.css`:

```css
--background: Dark background color
--foreground: Text color
--card: Card background
--border: Border color
--primary: Primary accent color
```

### Dark Mode
Dark mode is enabled by default in `layout.tsx`:
```tsx
<html lang="en" className="dark">
```

## 🚧 TODO: AI Integration

Currently, the application uses mock data for AI generation. To integrate with a real AI service:

1. **Google Gemini Vision API**:
```typescript
// In handleGenerate function
const response = await fetch('/api/generate', {
  method: 'POST',
  body: JSON.stringify({ image: canvasData })
});
```

2. **OpenAI GPT-4 Vision**:
```typescript
// Alternative implementation
const completion = await openai.chat.completions.create({
  model: "gpt-4-vision-preview",
  messages: [{ 
    role: "user", 
    content: [{ type: "image_url", image_url: canvasData }] 
  }]
});
```

3. Create API routes in `src/app/api/` for backend integration

## 📝 Usage Guide

1. **Draw Your Layout**: Use the canvas tools to sketch your website layout
2. **Generate**: Click the "Generate Website" button
3. **Preview**: View the generated website in the preview panel
4. **View Code**: Toggle to code view to see the HTML/CSS
5. **Refine**: Use the text input to describe changes
6. **Update**: Click "Update" to refine the generated website

## 🎯 Keyboard Shortcuts

- `Ctrl + Enter`: Submit refinement
- Canvas tools: Use tldraw's built-in shortcuts

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Crazeecoder01**
- GitHub: [@Crazeecoder01](https://github.com/Crazeecoder01)

## 🙏 Acknowledgments

- [tldraw](https://tldraw.com/) - Amazing drawing canvas library
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful UI components
- [Next.js](https://nextjs.org/) - The React framework
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework

---

Made with ❤️ using Next.js and React
