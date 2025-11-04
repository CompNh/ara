import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import { AraProvider, AraThemeBoundary } from "@ara/react";
import App from "./App";

const container = document.getElementById("root");

if (!container) {
  throw new Error("루트 요소를 찾을 수 없습니다.");
}

const root = createRoot(container);

root.render(
  <StrictMode>
    <AraProvider>
      <AraThemeBoundary>
        <App />
      </AraThemeBoundary>
    </AraProvider>
  </StrictMode>
);
