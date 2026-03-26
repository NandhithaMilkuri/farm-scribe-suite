import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { clearOldData } from "./lib/clearOldData";

// Clear all old demo/test data on first load
clearOldData();

createRoot(document.getElementById("root")!).render(<App />);
