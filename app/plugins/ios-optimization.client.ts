// Extend the Window interface to include your custom properties
declare global {
  interface Window {
    _lastTouchEnd?: number;
    _lastTouchY?: number;
  }
}

export default defineNuxtPlugin(() => {
  if (import.meta.client) {
    // Prevent double-tap zoom on iOS
    document.addEventListener(
      "touchend",
      (e: TouchEvent) => {
        const now = Date.now();
        const DOUBLE_TAP_THRESHOLD = 300;

        if (now - (window._lastTouchEnd || 0) < DOUBLE_TAP_THRESHOLD) {
          e.preventDefault();
        }

        window._lastTouchEnd = now;
      },
      { passive: false }
    );

    // Track touch start Y position
    document.body.addEventListener(
      "touchstart",
      (e: TouchEvent) => {
        window._lastTouchY = e.touches[0].clientY;
      },
      { passive: true }
    );

    // Prevent pinch-to-zoom gesture
    document.addEventListener(
      "gesturestart",
      (e: Event) => {
        e.preventDefault();
      },
      { passive: false }
    );

    document.addEventListener(
      "gesturechange",
      (e: Event) => {
        e.preventDefault();
      },
      { passive: false }
    );

    document.addEventListener(
      "gestureend",
      (e: Event) => {
        e.preventDefault();
      },
      { passive: false }
    );

    // Add viewport meta tag to prevent zooming
    const ensureViewportMeta = () => {
      let viewportMeta = document.querySelector(
        'meta[name="viewport"]'
      ) as HTMLMetaElement;

      if (!viewportMeta) {
        viewportMeta = document.createElement("meta") as HTMLMetaElement;
        viewportMeta.name = "viewport";
        document.head.appendChild(viewportMeta);
      }

      // Set viewport to prevent user scaling
      viewportMeta.content =
        "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no";
    };

    ensureViewportMeta();

    // Add iOS home indicator padding
    const addSafeAreaPadding = () => {
      document.documentElement.style.setProperty(
        "--safe-area-inset-bottom",
        "env(safe-area-inset-bottom, 0px)"
      );
    };

    window.addEventListener("resize", addSafeAreaPadding);
    addSafeAreaPadding();

    // Add touch-action CSS to prevent browser handling of touch gestures
    const addTouchActionCSS = () => {
      const style = document.createElement("style");
      style.textContent = `
          html, body {
            touch-action: pan-x pan-y;
            -webkit-touch-callout: none;
            -webkit-user-select: none;
            user-select: none;
          }
          
          /* Allow scrolling but prevent zooming */
          * {
            touch-action: pan-x pan-y;
          }
          
          /* Re-enable text selection in inputs and textareas */
          input, textarea {
            -webkit-user-select: auto;
            user-select: auto;
          }
        `;
      document.head.appendChild(style);
    };

    addTouchActionCSS();
  }
});
