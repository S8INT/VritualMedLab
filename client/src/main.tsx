import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Preload fonts
const fontLinks = [
  "https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&family=Open+Sans:wght@400;600&family=Roboto+Mono&display=swap",
  "https://fonts.googleapis.com/icon?family=Material+Icons"
];

fontLinks.forEach(href => {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  document.head.appendChild(link);
});

// Set page title
const title = document.createElement("title");
title.textContent = "VirtualLab - Medical Laboratory Clinical Practice Platform";
document.head.appendChild(title);

// Render the app
createRoot(document.getElementById("root")!).render(<App />);
