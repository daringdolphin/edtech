/*
<ai_context>
Design tokens helper for MathCraft.
Provides programmatic access to design values for inline styles and animations.
Based on .planning/design-guidelines.md
</ai_context>
*/

/**
 * MathCraft Design Tokens
 * 
 * These tokens encode the visual decisions for the app.
 * Use these values when you need programmatic access to design values
 * in JavaScript/TypeScript (e.g., for Framer Motion animations).
 */

// =============================================================================
// COLOR SYSTEM
// =============================================================================

export const colors = {
  light: {
    background: "hsl(215, 35%, 97%)",
    foreground: "hsl(222, 32%, 12%)",
    card: "#FFFFFF",
    cardForeground: "hsl(222, 32%, 12%)",
    primary: "hsl(221, 70%, 50%)",
    primaryForeground: "hsl(210, 40%, 98%)",
    secondary: "hsl(210, 28%, 96%)",
    secondaryForeground: "hsl(222, 32%, 15%)",
    muted: "hsl(214, 28%, 94%)",
    mutedForeground: "hsl(215, 15%, 46%)",
    accent: "hsl(214, 50%, 95%)",
    accentForeground: "hsl(222, 32%, 15%)",
    destructive: "hsl(0, 72%, 58%)",
    destructiveForeground: "hsl(210, 40%, 98%)",
    border: "hsl(214, 26%, 88%)",
    input: "hsl(214, 26%, 92%)",
    ring: "hsl(221, 75%, 55%)"
  },
  dark: {
    background: "hsl(222, 60%, 6%)",
    foreground: "hsl(210, 40%, 96%)",
    card: "hsl(222, 60%, 7%)",
    cardForeground: "hsl(210, 40%, 96%)",
    primary: "hsl(217, 85%, 68%)",
    primaryForeground: "hsl(222, 47%, 11%)",
    secondary: "hsl(220, 26%, 18%)",
    secondaryForeground: "hsl(210, 40%, 96%)",
    muted: "hsl(220, 24%, 16%)",
    mutedForeground: "hsl(215, 20%, 70%)",
    accent: "hsl(220, 30%, 20%)",
    accentForeground: "hsl(210, 40%, 96%)",
    destructive: "hsl(0, 65%, 40%)",
    destructiveForeground: "hsl(210, 40%, 98%)",
    border: "hsl(220, 26%, 24%)",
    input: "hsl(220, 26%, 20%)",
    ring: "hsl(221, 80%, 65%)"
  },
  diagram: {
    grid: "#E5E7EB",
    selection: "hsl(221, 83%, 60%)"
  }
} as const

// =============================================================================
// TYPOGRAPHY
// =============================================================================

export const typography = {
  fontFamily: {
    sans: '"Inter", system-ui, sans-serif',
    serif: '"Merriweather", Georgia, serif',
    mono: '"JetBrains Mono", "SFMono-Regular", monospace'
  },
  fontSize: {
    xs: "0.75rem",
    sm: "0.875rem",
    md: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    "3xl": "1.875rem",
    "4xl": "2.25rem"
  },
  fontWeight: {
    regular: 400,
    medium: 500,
    semibold: 600
  },
  lineHeight: {
    tight: 1.25,
    default: 1.5,
    relaxed: 1.7
  }
} as const

// =============================================================================
// SPACING & LAYOUT
// =============================================================================

export const spacing = {
  0: "0px",
  1: "4px",
  2: "8px",
  3: "12px",
  4: "16px",
  5: "20px",
  6: "24px",
  8: "32px",
  10: "40px",
  12: "48px",
  16: "64px"
} as const

export const radius = {
  none: "0px",
  sm: "6px",
  md: "8px",
  lg: "12px",
  xl: "16px",
  full: "999px"
} as const

export const layout = {
  worksheetMaxWidth: "793px", // A4 ~210mm
  sidebarWidth: "256px"
} as const

// =============================================================================
// MOTION
// =============================================================================

export const motion = {
  duration: {
    fast: 0.12, // 120ms
    base: 0.2, // 200ms
    slow: 0.32 // 320ms
  },
  /** Duration values in milliseconds */
  durationMs: {
    fast: 120,
    base: 200,
    slow: 320
  },
  easing: {
    standard: [0.4, 0, 0.2, 1] as [number, number, number, number],
    decelerate: [0, 0, 0.2, 1] as [number, number, number, number],
    accelerate: [0.4, 0, 1, 1] as [number, number, number, number]
  },
  /** CSS cubic-bezier strings */
  easingCss: {
    standard: "cubic-bezier(0.4, 0, 0.2, 1)",
    decelerate: "cubic-bezier(0, 0, 0.2, 1)",
    accelerate: "cubic-bezier(0.4, 0, 1, 1)"
  }
} as const

// =============================================================================
// ELEVATION & SHADOWS
// =============================================================================

export const elevation = {
  none: "none",
  xs: "0 1px 2px rgba(15, 23, 42, 0.06)",
  sm: "0 2px 6px rgba(15, 23, 42, 0.08)",
  md: "0 6px 18px rgba(15, 23, 42, 0.12)",
  lg: "0 12px 32px rgba(15, 23, 42, 0.18)"
} as const

// =============================================================================
// BREAKPOINTS
// =============================================================================

export const breakpoints = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536
} as const

// =============================================================================
// FRAMER MOTION PRESETS
// =============================================================================

/**
 * Pre-configured Framer Motion transition presets
 * Usage: <motion.div transition={transitions.base} />
 */
export const transitions = {
  fast: {
    duration: motion.duration.fast,
    ease: motion.easing.standard
  },
  base: {
    duration: motion.duration.base,
    ease: motion.easing.standard
  },
  slow: {
    duration: motion.duration.slow,
    ease: motion.easing.standard
  },
  enter: {
    duration: motion.duration.base,
    ease: motion.easing.decelerate
  },
  exit: {
    duration: motion.duration.fast,
    ease: motion.easing.accelerate
  }
} as const

/**
 * Pre-configured Framer Motion animation variants
 * Usage: <motion.div variants={variants.fadeIn} initial="initial" animate="animate" />
 */
export const variants = {
  fadeIn: {
    initial: { opacity: 0, y: 4 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 4 }
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.96 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.96 }
  },
  slideInRight: {
    initial: { opacity: 0, x: 16 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 16 }
  },
  slideInLeft: {
    initial: { opacity: 0, x: -16 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -16 }
  }
} as const

