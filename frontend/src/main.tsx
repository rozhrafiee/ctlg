import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./styles.css";
import { useAuthStore } from "./store/authStore";

// Initialize auth BEFORE rendering the app to avoid race conditions.
// We use an async IIFE so we can await the initializeAuth Promise.
(async () => {
  try {
    await useAuthStore.getState().initializeAuth();
  } catch (err) {
    // initialization errors are handled inside the store; ignore here
    // but you can console.error(err) for debugging if needed
  } finally {
    ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
      <React.StrictMode>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </React.StrictMode>
    );
  }
})();