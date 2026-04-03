import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { TRPCReactProvider } from "./lib/trpc";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <TRPCReactProvider>
      <App />
    </TRPCReactProvider>
  </React.StrictMode>
);
