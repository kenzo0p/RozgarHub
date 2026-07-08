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
