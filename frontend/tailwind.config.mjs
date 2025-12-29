/** @type {import("tailwindcss").Config} */
export default {
  content: [
    "./app/**/*.{ts,tsx,js,jsx}",
    "./pages/**/*.{ts,tsx,js,jsx}",
    "./components/**/*.{ts,tsx,js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        lcbgprimary: "#FFFFFF",
        lctextprimary: "#0B0D12",
        lctextsecondary: "#4B5563",
        lcborder: "#E5E7EB",
        lcaccent: "#312E81",
        lcaccentmuted: "#E0E7FF",
        lcaccentclient: "#065F46",
        lcaccentclientmuted: "#D1FAE5",
        lcbgattorney: "#0B0D12",
        lcbgattorneysecondary: "#111827",
        lctextattorney: "#F9FAFB",
        lctextattorneysecondary: "#9CA3AF",
        lcborderattorney: "#1F2937",
        lcaccentattorney: "#6366F1",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "ui-sans-serif", "system-ui"],
      },
      borderRadius: {
        md: "6px",
      },
    },
  },
  plugins: [],
};
