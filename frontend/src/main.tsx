import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import AuthProvider from "react-auth-kit/AuthProvider";
import createStore from "react-auth-kit/createStore";

const store = createStore({
  authName: "_auth",
  authType: "cookie",
  cookieDomain: window.location.hostname,
  cookieSecure: window.location.protocol === "http:",
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider store={store}>
      <App />
    </AuthProvider>
  </StrictMode>
);
