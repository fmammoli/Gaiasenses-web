/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        mont: ["var(--font-montserrat)"],
        pop: ["var(--font-poppins)"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        backgroundOpacity: "rgba(var(--background-opacity))",
        kandinsky: {
          blue: "hsl(var(--kandinsky-blue))",
        },
        space: {
          spaceBlue: "hsl(var(--space-blue)))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          title: "hsl(var(--primary-foreground-title))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        "my-fade-in-out": {
          "0%": { opacity: "0" },
          "10%": { opacity: "1" },
          "25%": { opacity: "1" },
          "50%": { opacity: "1" },
          "75%": { opacity: "1" },
          "85%": { opacity: "1" },
          "99%": { opacity: "0" },
          "100%": { opacity: "0" },
        },
        "my-fade-in-out-s": {
          "0%": { opacity: "0" },

          "50%": { opacity: "1" },

          "100%": { opacity: "0" },
        },
        "move-z": {
          "0%": { zIndex: 10 },
          "99%": { zIndex: 10 },
          "100%": { zIndex: -1 },
        },
        "f-s": {
          "0%": { opacity: "0" },
          "25%": { opacity: "1" },
          "50%": { opacity: "1" },
          "100%": { opacity: "1" },
        },
        "my-fade-out-k": {
          "0%": { opacity: 1 },
          "100%": { opacity: 0 },
        },
        "black-to-white": {
          from: { backgroundColor: "black" },
          to: { backgroundColor: "white" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "auto-fade-out": "auto-fade-out-k 10s ease-in-out forwards",
        "f-out": "fade-out-k 4s forwards ease-in",
        "title-page": "fade 4s ease-out 0s 1 reverse forwards",
        "composition-fade":
          "my-fade-in-out 300s cubic-bezier(0,1.26,0,1.02) 0s 1 normal forwards running",
        "composition-fade-2":
          "f-s 22s cubic-bezier(.47,.63,.23,1.4) 0s 2 alternate forwards running",
        "my-fade-in": "fade 4s ease-in-out 1s 1 normal forwards running",
        "my-fade-out": "my-fade-out-k 1s both",
        "background-color-fade":
          "black-to-white 4s ease-out 0s 1 normal both running",
      },
      transitionDuration: {
        "10s": "4000ms",
      },
      transitionProperty: {
        "my-opacity": "opacity",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("tailwindcss-animated")],
};
