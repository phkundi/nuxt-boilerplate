/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
    "./error.vue",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        display: ["Inter", "sans-serif"],
      },
      colors: {
        // primary: "var(--primary-color)",
        background: "#f1f5f9", // slate-100
        primary_text: {
          DEFAULT: "#181818",
          hover: "#181818",
        },
        muted: {
          // gray-500
          DEFAULT: "#6b7280",
          hover: "#9ca3af",
        },
        primary: {
          DEFAULT: "#1e293b",
          hover: "#1e293b",
        },
        accent: {
          DEFAULT: "#2563eb",
          hover: "#1d4ed8",
        },
        info: {
          // indigo-500
          DEFAULT: "#6366f1",
          hover: "#6366f1",
        },
        error: {
          // red-500
          DEFAULT: "#ef4444",
          text: "#fca5a5",
          background: "#fef2f2",
          hover: "#dc2626",
        },
        success: {
          DEFAULT: "#10b981", // green-500
          hover: "#059669", // green-600
        },
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
