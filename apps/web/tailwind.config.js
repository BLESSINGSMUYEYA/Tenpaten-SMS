/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // ─── shadcn/ui tokens (kept for existing components) ───
        border: "hsl(var(--border) / <alpha-value>)",
        input: "hsl(var(--input) / <alpha-value>)",
        ring: "hsl(var(--ring) / <alpha-value>)",
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        secondary: {
          DEFAULT: "hsl(var(--secondary) / <alpha-value>)",
          foreground: "hsl(var(--secondary-foreground) / <alpha-value>)",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted) / <alpha-value>)",
          foreground: "hsl(var(--muted-foreground) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "hsl(var(--accent) / <alpha-value>)",
          foreground: "hsl(var(--accent-foreground) / <alpha-value>)",
        },
        popover: {
          DEFAULT: "hsl(var(--popover) / <alpha-value>)",
          foreground: "hsl(var(--popover-foreground) / <alpha-value>)",
        },
        card: {
          DEFAULT: "hsl(var(--card) / <alpha-value>)",
          foreground: "hsl(var(--card-foreground) / <alpha-value>)",
        },

        // ─── MD3 Primary ───
        primary: {
          DEFAULT: "hsl(var(--md-primary) / <alpha-value>)",
          container: "hsl(var(--md-primary-container) / <alpha-value>)",
          fixed: "hsl(var(--md-primary-fixed) / <alpha-value>)",
          "fixed-dim": "hsl(var(--md-primary-fixed-dim) / <alpha-value>)",
          foreground: "hsl(var(--primary-foreground) / <alpha-value>)",
        },
        "on-primary": {
          DEFAULT: "hsl(var(--md-on-primary) / <alpha-value>)",
          container: "hsl(var(--md-on-primary-container) / <alpha-value>)",
          fixed: "hsl(var(--md-on-primary-fixed) / <alpha-value>)",
          "fixed-variant": "hsl(var(--md-on-primary-fixed-variant) / <alpha-value>)",
        },
        "primary-fixed": {
          DEFAULT: "hsl(var(--md-primary-fixed) / <alpha-value>)",
          dim: "hsl(var(--md-primary-fixed-dim) / <alpha-value>)",
        },
        "primary-fixed-dim": "hsl(var(--md-primary-fixed-dim) / <alpha-value>)",
        "on-primary-fixed": "hsl(var(--md-on-primary-fixed) / <alpha-value>)",
        "on-primary-fixed-variant": "hsl(var(--md-on-primary-fixed-variant) / <alpha-value>)",
        "on-secondary-fixed": "hsl(var(--md-on-secondary-fixed) / <alpha-value>)",
        "on-secondary-fixed-variant": "hsl(var(--md-on-secondary-fixed-variant) / <alpha-value>)",
        "on-tertiary-fixed": "hsl(var(--md-on-tertiary-fixed) / <alpha-value>)",
        "on-tertiary-fixed-variant": "hsl(var(--md-on-tertiary-fixed-variant) / <alpha-value>)",
        "inverse-primary": "hsl(var(--md-inverse-primary) / <alpha-value>)",

        // ─── MD3 Secondary ───
        "secondary-container": "hsl(var(--md-secondary-container) / <alpha-value>)",
        "on-secondary": "hsl(var(--md-on-secondary) / <alpha-value>)",
        "on-secondary-container": "hsl(var(--md-on-secondary-container) / <alpha-value>)",
        "secondary-fixed": "hsl(var(--md-secondary-fixed) / <alpha-value>)",
        "on-secondary-fixed-variant": "hsl(var(--md-on-secondary-fixed-variant) / <alpha-value>)",

        // ─── MD3 Tertiary ───
        tertiary: "hsl(var(--md-tertiary) / <alpha-value>)",
        "tertiary-container": "hsl(var(--md-tertiary-container) / <alpha-value>)",
        "on-tertiary": "hsl(var(--md-on-tertiary) / <alpha-value>)",
        "on-tertiary-container": "hsl(var(--md-on-tertiary-container) / <alpha-value>)",

        // ─── MD3 Error ───
        error: "hsl(var(--md-error) / <alpha-value>)",
        "error-container": "hsl(var(--md-error-container) / <alpha-value>)",
        "on-error": "hsl(var(--md-on-error) / <alpha-value>)",
        "on-error-container": "hsl(var(--md-on-error-container) / <alpha-value>)",

        // ─── MD3 Surface ───
        surface: {
          DEFAULT: "hsl(var(--md-surface) / <alpha-value>)",
          dim: "hsl(var(--md-surface-dim) / <alpha-value>)",
          bright: "hsl(var(--md-surface-bright) / <alpha-value>)",
          border: "hsl(var(--md-surface-border) / <alpha-value>)",
          container: {
            DEFAULT: "hsl(var(--md-surface-container) / <alpha-value>)",
            lowest: "hsl(var(--md-surface-container-lowest) / <alpha-value>)",
            low: "hsl(var(--md-surface-container-low) / <alpha-value>)",
            high: "hsl(var(--md-surface-container-high) / <alpha-value>)",
            highest: "hsl(var(--md-surface-container-highest) / <alpha-value>)",
          },
        },
        "on-surface": {
          DEFAULT: "hsl(var(--md-on-surface) / <alpha-value>)",
          variant: "hsl(var(--md-on-surface-variant) / <alpha-value>)",
        },
        "surface-border": "hsl(var(--md-surface-border) / <alpha-value>)",
        "surface-dim": "hsl(var(--md-surface-dim) / <alpha-value>)",
        "surface-container": "hsl(var(--md-surface-container) / <alpha-value>)",
        "surface-container-lowest": "hsl(var(--md-surface-container-lowest) / <alpha-value>)",
        "surface-container-low": "hsl(var(--md-surface-container-low) / <alpha-value>)",
        "surface-container-high": "hsl(var(--md-surface-container-high) / <alpha-value>)",
        "surface-container-highest": "hsl(var(--md-surface-container-highest) / <alpha-value>)",
        "on-surface-variant": "hsl(var(--md-on-surface-variant) / <alpha-value>)",
        "inverse-surface": "hsl(var(--md-inverse-surface) / <alpha-value>)",
        "inverse-on-surface": "hsl(var(--md-inverse-on-surface) / <alpha-value>)",

        // ─── MD3 Outline ───
        outline: {
          DEFAULT: "hsl(var(--md-outline) / <alpha-value>)",
          variant: "hsl(var(--md-outline-variant) / <alpha-value>)",
        },
        "outline-variant": "hsl(var(--md-outline-variant) / <alpha-value>)",

        // ─── Brand palette ───
        brand: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
      },

      // ─── MD3 Typography scale ───
      fontSize: {
        // Display
        "display-lg": ["3.5625rem", { lineHeight: "4rem",    letterSpacing: "-0.015625rem", fontWeight: "400" }],
        "display-md": ["2.8125rem", { lineHeight: "3.25rem", letterSpacing: "0",            fontWeight: "400" }],
        "display-sm": ["2.25rem",   { lineHeight: "2.75rem", letterSpacing: "0",            fontWeight: "400" }],
        // Headline
        "headline-lg": ["2rem",    { lineHeight: "2.5rem",  letterSpacing: "0",             fontWeight: "400" }],
        "headline-md": ["1.75rem", { lineHeight: "2.25rem", letterSpacing: "0",             fontWeight: "400" }],
        "headline-sm": ["1.5rem",  { lineHeight: "2rem",    letterSpacing: "0",             fontWeight: "400" }],
        // Title
        "title-lg": ["1.375rem", { lineHeight: "1.75rem", letterSpacing: "0",           fontWeight: "400" }],
        "title-md": ["1rem",     { lineHeight: "1.5rem",  letterSpacing: "0.009375rem", fontWeight: "500" }],
        "title-sm": ["0.875rem", { lineHeight: "1.25rem", letterSpacing: "0.00625rem",  fontWeight: "500" }],
        // Body
        "body-lg": ["1rem",     { lineHeight: "1.5rem",  letterSpacing: "0.03125rem",  fontWeight: "400" }],
        "body-md": ["0.875rem", { lineHeight: "1.25rem", letterSpacing: "0.015625rem", fontWeight: "400" }],
        "body-sm": ["0.75rem",  { lineHeight: "1rem",    letterSpacing: "0.025rem",    fontWeight: "400" }],
        // Label
        "label-lg": ["0.875rem", { lineHeight: "1.25rem", letterSpacing: "0.00625rem",  fontWeight: "500" }],
        "label-md": ["0.75rem",  { lineHeight: "1rem",    letterSpacing: "0.03125rem",  fontWeight: "500" }],
        "label-sm": ["0.6875rem",{ lineHeight: "1rem",    letterSpacing: "0.03125rem",  fontWeight: "500" }],
        "label-sm-mobile": ["0.625rem", { lineHeight: "0.875rem", letterSpacing: "0.03125rem", fontWeight: "500" }],
      },

      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Outfit', 'Inter', 'sans-serif'],
      },

      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },

      spacing: {
        "xs": "4px",
        "base": "4px",
        "sm": "8px",
        "md": "16px",
        "lg": "24px",
        "xl": "40px",
        "gutter": "16px",
        "gutter-desktop": "24px",
        "margin-mobile":  "16px",
        "margin-desktop": "32px",
        "safe": "env(safe-area-inset-bottom, 0px)",
      },

      animation: {
        "accordion-down":   "accordion-down 0.2s ease-out",
        "accordion-up":     "accordion-up 0.2s ease-out",
        "fade-in":          "fade-in 0.3s ease-out",
        "slide-in-bottom":  "slide-in-bottom 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-down":       "slide-down 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-up":         "slide-up 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
        "scale-in":         "scale-in 0.2s ease-out",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to:   { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to:   { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to:   { opacity: "1" },
        },
        "slide-in-bottom": {
          from: { transform: "translateY(1rem)", opacity: "0" },
          to:   { transform: "translateY(0)",    opacity: "1" },
        },
        "slide-down": {
          from: { transform: "translateY(-100%)", opacity: "0" },
          to:   { transform: "translateY(0)",      opacity: "1" },
        },
        "slide-up": {
          from: { transform: "translateY(1.5rem)", opacity: "0" },
          to:   { transform: "translateY(0)",      opacity: "1" },
        },
        "scale-in": {
          from: { transform: "scale(0.95)", opacity: "0" },
          to:   { transform: "scale(1)",    opacity: "1" },
        },
      },
    },
  },
  plugins: [],
}
