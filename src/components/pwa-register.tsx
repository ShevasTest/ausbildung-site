"use client";

import { useEffect } from "react";

type IdleWindow = Window & {
  requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
  cancelIdleCallback?: (handle: number) => void;
};

export function PwaRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    const registerServiceWorker = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Registration errors should not block page rendering.
      });
    };

    const idleWindow = window as IdleWindow;

    if (typeof idleWindow.requestIdleCallback === "function") {
      const idleHandle = idleWindow.requestIdleCallback(registerServiceWorker, {
        timeout: 2000,
      });

      return () => {
        if (typeof idleWindow.cancelIdleCallback === "function") {
          idleWindow.cancelIdleCallback(idleHandle);
        }
      };
    }

    const timeoutHandle = window.setTimeout(registerServiceWorker, 1200);

    return () => {
      window.clearTimeout(timeoutHandle);
    };
  }, []);

  return null;
}
