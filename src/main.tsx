import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { clearOldData } from "./lib/clearOldData";
import { HashRouter } from "react-router-dom"; // ✅ ADD THIS

// Clear all old demo/test data on first load
clearOldData();

createRoot(document.getElementById("root")!).render(
  <HashRouter>   {/* ✅ WRAP APP */}
    <App />
  </HashRouter>
);
