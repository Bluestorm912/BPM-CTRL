export const registerServiceWorker = () => {
  if (!("serviceWorker" in navigator) || import.meta.env.DEV) return;

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").then((registration) => {
      registration.update().catch(() => undefined);
    }).catch(() => {
      // A service worker should enhance installability, never block the app.
    });
  });
};
