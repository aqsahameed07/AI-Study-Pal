/**
 * Semantic design tokens for the mobile app.
 *
 * These tokens mirror the naming conventions used in web artifacts (index.css)
 * so that multi-artifact projects share a cohesive visual identity.
 *
 * Replace the placeholder values below with values that match the project's
 * brand. If a sibling web artifact exists, read its index.css and convert the
 * HSL values to hex so both artifacts use the same palette.
 *
 * To add dark mode, add a `dark` key with the same token names.
 * The useColors() hook will automatically pick it up.
 */

const colors = {
  light: {
    // Legacy aliases (kept for backward compatibility)
    text: '#F4F7FB',
    tint: '#FF8066',

    // Core surfaces
    background: '#0B1730',
    foreground: '#F4F7FB',

    // Cards / elevated surfaces
    card: '#122442',
    cardForeground: '#F4F7FB',

    // Primary action color (buttons, links, active states)
    primary: '#FF8066',
    primaryForeground: '#0B1730',

    // Secondary / less-emphasis interactive surfaces
    secondary: '#193254',
    secondaryForeground: '#DCE7F5',

    // Muted / subdued elements (dividers, timestamps, placeholders)
    muted: '#142B4A',
    mutedForeground: '#8EA4C0',

    // Accent highlights (badges, selected items, focus rings)
    accent: '#45D2C8',
    accentForeground: '#07162D',

    // Destructive actions (delete, error states)
    destructive: '#FF6B78',
    destructiveForeground: '#FFF4F2',

    // Borders and input outlines
    border: '#284364',
    input: '#284364',
  },
  dark: {
    text: '#F4F7FB',
    tint: '#FF8066',
    background: '#071329',
    foreground: '#F4F7FB',
    card: '#10213D',
    cardForeground: '#F4F7FB',
    primary: '#FF8066',
    primaryForeground: '#071329',
    secondary: '#183355',
    secondaryForeground: '#DCE7F5',
    muted: '#112844',
    mutedForeground: '#8EA4C0',
    accent: '#45D2C8',
    accentForeground: '#07162D',
    destructive: '#FF6B78',
    destructiveForeground: '#FFF4F2',
    border: '#284364',
    input: '#284364',
  },

  // Border radius (in px). Sync from the sibling web artifact's --radius
  // CSS variable. This value applies to cards, buttons, inputs, and modals.
  radius: 8,
};

export default colors;
