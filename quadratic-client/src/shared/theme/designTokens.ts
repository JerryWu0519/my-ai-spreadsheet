/**
 * Banksheet Design Tokens
 *
 * Centralized design tokens for the Banksheet visual identity.
 * These are consumed via CSS variables and Tailwind config.
 * DO NOT modify spreadsheet engine or business logic.
 */

export const designTokens = {
  // ── Brand Colors ───────────────────────────────────────────
  brand: {
    primary: '#1a1a2e', // Deep navy – primary brand
    secondary: '#16213e', // Navy blue – secondary surfaces
    accent: '#0f3460', // Accent blue – interactive elements
    highlight: '#e94560', // Coral red – highlights / CTAs (sparingly)
    surface: '#f8f9fb', // Off-white – main background
    surfaceAlt: '#f1f3f6', // Slightly darker – card backgrounds
    border: '#e2e6ed', // Soft gray border
    borderSubtle: '#eef0f4', // Even lighter border (grid lines)
    text: '#1a1a2e', // Primary text
    textSecondary: '#6b7280', // Secondary text
    textMuted: '#9ca3af', // Muted / hint text
  },

  // ── Typography ─────────────────────────────────────────────
  typography: {
    fontFamily: {
      sans: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      mono: "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, 'Courier New', monospace",
    },
    fontSize: {
      xs: '0.75rem', // 12px
      sm: '0.8125rem', // 13px
      base: '0.875rem', // 14px
      md: '1rem', // 16px
      lg: '1.125rem', // 18px
      xl: '1.25rem', // 20px
      '2xl': '1.5rem', // 24px
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.625,
    },
  },

  // ── Spacing & Layout ──────────────────────────────────────
  spacing: {
    xs: '0.25rem', // 4px
    sm: '0.5rem', // 8px
    md: '0.75rem', // 12px
    lg: '1rem', // 16px
    xl: '1.5rem', // 24px
    '2xl': '2rem', // 32px
    '3xl': '3rem', // 48px
  },

  // ── Border Radius ─────────────────────────────────────────
  radius: {
    sm: '0.25rem', // 4px
    md: '0.5rem', // 8px
    lg: '0.75rem', // 12px
    xl: '1rem', // 16px
    full: '9999px',
  },

  // ── Shadows ────────────────────────────────────────────────
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.04)',
    md: '0 2px 8px rgba(0, 0, 0, 0.06)',
    lg: '0 4px 16px rgba(0, 0, 0, 0.08)',
    card: '0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)',
    cardHover: '0 4px 12px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04)',
  },

  // ── Transitions ────────────────────────────────────────────
  transitions: {
    fast: '120ms ease',
    normal: '200ms ease',
    slow: '300ms ease-in-out',
  },
} as const;
