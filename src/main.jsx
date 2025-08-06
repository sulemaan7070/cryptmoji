import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import AppNew from "./AppNew.jsx";
import AppNew2 from "./AppNew2.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {/* <App /> */}
    {/* <AppNew /> */}
    <AppNew2 />
  </StrictMode>
);
