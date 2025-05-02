import React from 'react';
import ReactDOM from 'react-dom/client';
import "./index.css";
import App from "./App.tsx";
import { ThemeProvider } from "./components/ThemeProvider";
import { LanguageProvider } from "./components/LanguageProvider";
import { fonts } from './lib/fonts';

// Apply fonts to document
document.documentElement.style.setProperty('--font-sans', fonts.sans);
document.documentElement.style.setProperty('--font-arabic', fonts.arabic);

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Failed to find root element");
}

ReactDOM.createRoot(rootElement).render(
  <ThemeProvider defaultTheme="light" storageKey="flashcard-theme">
    <LanguageProvider defaultLanguage="en">
      <App />
    </LanguageProvider>
  </ThemeProvider>
);
