import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

import { userSession } from "@/lib/stacks-auth";

createRoot(document.getElementById("root")!).render(
    <App />
);
