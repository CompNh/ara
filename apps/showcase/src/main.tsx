import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import App from "./App.tsx";
import { AraProvider } from "@ara/react";

const container = document.getElementById("root");

if (!container) {
  throw new Error("루트 요소를 찾을 수 없습니다.");
}

const root = createRoot(container);

root.render(
  <StrictMode>
    <AraProvider>
      <App />
    </AraProvider>
  </StrictMode>
);
