import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { Toaster } from "./components/ui/sonner";
import { Provider } from "react-redux";
import store from "./redux/store.js";
import { persistStore } from "redux-persist";
import { PersistGate } from "redux-persist/integration/react";
import { I18nProvider } from "./i18n/I18nProvider";
import { initGlobalErrorHandlers } from "./lib/monitoring";

// Catch errors that escape React's render tree (uncaught / unhandled rejections).
initGlobalErrorHandlers();

const persistor = persistStore(store);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <I18nProvider>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <App />
        </PersistGate>
      </Provider>
      <Toaster />
    </I18nProvider>
  </StrictMode>
);

// Register the service worker for offline support. Production only — a SW in
// dev would cache stale modules and fight Vite's HMR.
if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Non-critical — the app works fine without offline support.
    });
  });
}
