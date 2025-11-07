import "./main.css";
import { createRoot } from "react-dom/client";
import { App } from "./app.tsx";
import { LanguageService } from "@/core/services/language_service.ts";

LanguageService.initialize().then(() => {
  const container = document.getElementById("root")!;
  const root = createRoot(container);
  root.render(<App />);
});
