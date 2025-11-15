# Quizda Design System — Light & Dark Palettes

This repository follows a consistent Design System for both Light and Dark themes.
This document defines color tokens, usage guidance, and recommended patterns for components, accessibility, and migration.

---

## Overview

- Purpose: Provide a single source of truth for colors, type, spacing, and component aesthetics.
- Scope: Color tokens (light and dark), neutral system, brand colors, accent colors, status colors, and guidance for usage in UIs.
- Implementation: Tokens are exported as CSS variables (for runtime switching) and TypeScript constants (for code-driven theming — MUI).

---

## Design Principles

- Calm & Trustworthy: Use muted green as the primary brand color; orange for energy.
- Low Contrast Backgrounds: Avoid harsh pure white (#ffffff) and pure black (#000000); use near-white and near-black bases.
- WCAG-driven: Tokens are designed to satisfy accessibility standards with 4.5:1 contrast for primary text when used on appropriate surfaces.
- Consistency: Use tokens for colors and spacing in MUI components instead of ad-hoc hex strings.

---

## Token Categories

1. Brand / Primary Colors
2. Neutral System (Text, Cards, Surfaces)
3. Accent Colors
4. Status Colors (success, warning, error, info)
5. Dark Mode Tokens
6. Typography tokens (fonts & weights) — optional (see `designSystem.ts` for typography settings)

---

## Light Mode Palette

Brand / Primary Colors

- --primary-green: #2E7D50  // Muted emerald
- --primary-green-light: #E8F3ED
- --primary-green-dark: #1F5C3A

- --primary-orange: #D9822B
- --primary-orange-light: #FFF4E5
- --primary-orange-dark: #A56620

Neutral System

- --background: #FAFAFA
- --surface: #F3F4F3
- --surface-hover: #EBECEB
- --text-primary: #1C1C1C
- --text-secondary: #5D5D5D
- --text-disabled: #A6A6A6

Accents

- --accent-blue: #497AA7
- --accent-purple: #8566C2
- --accent-yellow: #E0C865

Status

- --success: #2E7D50
- --warning: #E5962E
- --error: #C64545
- --info: #497AA7

---

## Dark Mode Palette (Near-Black Surfaces)

Base Surfaces:
- --background-dark: #121416
- --surface-dark: #1A1C1E
- --surface-dark-hover: #232527
- --divider-dark: #2C2E30

Text in Dark Mode:
- --text-primary-dark: #E6E6E6
- --text-secondary-dark: #B3B3B3
- --text-disabled-dark: #6E6E6E

Brand Colors for Dark Backgrounds:
- --primary-green-darkmode: #4EBF7A
- --primary-green-darkmode-subtle: #1E3B2A

- --primary-orange-darkmode: #E6A34F
- --primary-orange-darkmode-subtle: #3F2D1B

Accent Colors (Dark Mode):
- --accent-blue-dark: #6BA8D1
- --accent-purple-dark: #A890DA
- --accent-yellow-dark: #DDBB5A

Status Colors (Dark Mode):
- --success: #4EBF7A
- --warning: #E6A34F
- --error: #D96A6A
- --info: #6BA8D1

---

## Usage Guidelines

- Prefer token names over raw hex codes in components, styles, and theme configurations.
- Use `--surface` for cards, tiles, and bento blocks; use `--surface-hover` for hover states.
- Use `--text-primary` on `--background` and `--text-primary-dark` on `--background-dark`.
- Avoid injecting user data into logs or UI styles directly; use tokens for styling consistent colors.
- Keep the brand accent (primary-green) for primary CTA, positive states, and success badges.

---

## MUI Theme Integration Example (Guidance)

We recommend exposing color tokens via both a CSS variables file (‘designTokens.css’) and a `DesignTokens` TypeScript export for programmatic usage in MUI theme files. For example:

- CSS variables: `client/src/theme/designTokens.css` with light and dark `:root` sections.
- TypeScript: `client/src/theme/designTokens.ts` exporter for the token values, used by MUI createTheme.

---

## Accessibility & WCAG

- Primary text must achieve at least 4.5:1 contrast with its background. Test using tools like Lighthouse or Contrast Checker.
- Colors designated for statuses are chosen to avoid false positives and keep a consistent tone across both light and dark modes.

---

## Migration Recommendations

- Replace existing hex references in the repo with token references.
- Wrap tokens into MUI palette via `createTheme` and use `ThemeProvider`.
- Gradually replace inline styles with token-based values:
  - `bgcolor: designSystem.colors.darkBg` → `bgcolor: tokens.surface` or `var(--surface)`
  - Text colors: `color: designSystem.colors.textLight` → `color: var(--text-primary-dark)`

---

## Example: Inline usage with CSS variable

  background: var(--surface);
  color: var(--text-primary);

  &:hover {
    background: var(--surface-hover);
  }

---

## Implementation Notes

- This file is the canonical spec for the token values; if you update tokens, update both the CSS file and TypeScript exports.
- Add a short `README.md` in `client/src/theme` that explains where tokens live and how to use them in React / MUI components.

---

## Change Log / Versioning

- v1: Initial token set created (2024-11-15) — Light and Dark palettes

---

## Contributors
- Design System curated by the Quizda Team
- Maintainers: `client/src/theme/designSystem.ts`

---

## Next Steps (Optional)

- Add `designTokens.css` and `designTokens.ts` files under `client/src/theme`.
- Add eslint rule to prevent hard-coded hex values (optional).
- Add Storybook tales demonstrating the token usage across smaller components (optional).

---

Appendix: Full CSS variable token export is included in the `designTokens.css` file under `client/src/theme`.
