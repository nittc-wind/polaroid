"use client";

import { useEffect } from "react";

export default function PWAProvider() {
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      window.workbox !== undefined
    ) {
      // Workbox is loaded, register service worker
      const wb = window.workbox;

      const promptNewVersionAvailable = () => {
        if (confirm("新しいバージョンが利用可能です。更新しますか？")) {
          wb.addEventListener("controlling", () => {
            window.location.reload();
          });
          wb.messageSW({ type: "SKIP_WAITING" });
        }
      };

      wb.addEventListener("waiting", promptNewVersionAvailable);
      wb.register();
    } else if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      // Manual service worker registration
      navigator.serviceWorker
        .register("/sw.js", {
          scope: "/",
          updateViaCache: "none",
        })
        .then((registration) => {
          console.log(
            "PWA: Service Worker registered successfully:",
            registration.scope,
          );

          // Check for updates
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (
                  newWorker.state === "installed" &&
                  navigator.serviceWorker.controller
                ) {
                  // New content is available, prompt user to refresh
                  if (
                    confirm("新しいバージョンが利用可能です。更新しますか？")
                  ) {
                    window.location.reload();
                  }
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error("PWA: Service Worker registration failed:", error);
        });
    }
  }, []);

  return null;
}

// Extend window type for workbox
declare global {
  interface Window {
    workbox?: {
      addEventListener: (event: string, callback: () => void) => void;
      messageSW: (message: { type: string }) => void;
      register: () => void;
    };
  }
}
