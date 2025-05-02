import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { ThemeProvider } from "./components/ThemeProvider";
import { LanguageProvider } from "./components/LanguageProvider";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Failed to find root element");
}

createRoot(rootElement).render(
  <ThemeProvider defaultTheme="light" storageKey="flashcard-theme">
    <LanguageProvider defaultLanguage="en">
      <App />
    </LanguageProvider>
  </ThemeProvider>
);
