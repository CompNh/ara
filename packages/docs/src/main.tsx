import "../../tokens/dist/tokens/variables.css"; // Ensure tokens are loaded first
import React from "react";
import { createRoot } from "react-dom/client";

import App from "./ui/App";

createRoot(document.getElementById("root")!).render(<App />);
