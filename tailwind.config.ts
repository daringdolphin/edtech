/*
<ai_context>
Configures Tailwind CSS for the app.
Extended with MathCraft design tokens.
</ai_context>
*/

import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}"
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px"
      }
    },
    screens: {
      xs: "0px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px"
    },
    extend: {
      /* Typography - MathCraft Design Tokens */
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        serif: ["Merriweather", "Georgia", "serif"],
        mono: ["JetBrains Mono", "SFMono-Regular", "monospace"]
      },
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1.5" }],
        sm: ["0.875rem", { lineHeight: "1.5" }],
        md: ["1rem", { lineHeight: "1.5" }],
        lg: ["1.125rem", { lineHeight: "1.5" }],
        xl: ["1.25rem", { lineHeight: "1.25" }],
        "2xl": ["1.5rem", { lineHeight: "1.25" }],
        "3xl": ["1.875rem", { lineHeight: "1.25" }],
        "4xl": ["2.25rem", { lineHeight: "1.25" }]
      },
      fontWeight: {
        regular: "400",
        medium: "500",
        semibold: "600"
      },
      lineHeight: {
        tight: "1.25",
        default: "1.5",
        relaxed: "1.7"
      },
      /* Colors - MathCraft Design Tokens */
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))"
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))"
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))"
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))"
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))"
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))"
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))"
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))"
        },
        /* Diagram-specific colors */
        diagram: {
          grid: "var(--diagram-grid)",
          selection: "hsl(var(--diagram-selection))"
        }
      },
      /* Spacing Scale - 4px increments */
      spacing: {
        "0": "0px",
        "1": "4px",
        "2": "8px",
        "3": "12px",
        "4": "16px",
        "5": "20px",
        "6": "24px",
        "8": "32px",
        "10": "40px",
        "12": "48px",
        "16": "64px"
      },
      /* Border Radius - MathCraft Design Tokens */
      borderRadius: {
        none: "0px",
        sm: "6px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        full: "999px",
        DEFAULT: "var(--radius)"
      },
      /* Elevation/Shadow System */
      boxShadow: {
        none: "none",
        xs: "var(--shadow-xs)",
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)"
      },
      /* Motion/Transition Tokens */
      transitionDuration: {
        fast: "120ms",
        base: "200ms",
        slow: "320ms"
      },
      transitionTimingFunction: {
        standard: "cubic-bezier(0.4, 0, 0.2, 1)",
        decelerate: "cubic-bezier(0, 0, 0.2, 1)",
        accelerate: "cubic-bezier(0.4, 0, 1, 1)"
      },
      /* Layout constraints */
      maxWidth: {
        worksheet: "793px", // A4 width ~210mm
        sidebar: "256px"
      },
      /* Keyframes */
      keyframes: {
        "accordion-down": {
          from: {
            height: "0"
          },
          to: {
            height: "var(--radix-accordion-content-height)"
          }
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)"
          },
          to: {
            height: "0"
          }
        },
        gradient: {
          to: {
            backgroundPosition: "var(--bg-size) 0"
          }
        },
        "fade-in": {
          from: {
            opacity: "0",
            transform: "translateY(4px)"
          },
          to: {
            opacity: "1",
            transform: "translateY(0)"
          }
        },
        "scale-in": {
          from: {
            opacity: "0",
            transform: "scale(0.96)"
          },
          to: {
            opacity: "1",
            transform: "scale(1)"
          }
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        gradient: "gradient 8s linear infinite",
        "fade-in": "fade-in 200ms cubic-bezier(0, 0, 0.2, 1)",
        "scale-in": "scale-in 200ms cubic-bezier(0, 0, 0.2, 1)"
      }
    }
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")]
} satisfies Config

export default config
