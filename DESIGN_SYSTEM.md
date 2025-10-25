# 🎨 Quizda Design System

A minimal, high-contrast design system focused on clarity, accessibility, and intentional use of color.

---

## COLOR PALETTE

### Primary Colors

- **Primary Dark**: `#121212` (Black)
- **Primary Light**: `#FFFFFF` (White)

### Accent Colors

- **Accent Green**: `#00B15E` (Success, Action, Confirmation)
- **Accent Orange**: `#FF7A00` (Highlight, Warning, Alert)

### Neutral

- **Neutral Gray**: `#E0E0E0` (Borders, Dividers)

---

## 🧱 DESIGN PRINCIPLES

### 1. Minimalism

- High contrast between elements
- Generous whitespace
- Maximum 3 colors per screen
- Let content breathe

### 2. Accent Control

**One accent color per context:**

- ✅ **Green** = Success, action buttons, confirmation states, progress
- 🔶 **Orange** = Highlights, warnings, alerts, pending states
- ❌ **Never mix both heavily** in the same visual frame

### 3. Typography

- **Fonts**: Inter, Poppins, or system sans-serif
- **Contrast Rules**:
  - Black (`#121212`) text on light backgrounds
  - White (`#FFFFFF`) text on dark backgrounds
- **Hierarchy**: Use size and weight, not color

### 4. Shadows and Borders

- **Soft Shadows**: `rgba(0, 0, 0, 0.1)` for depth
- **Subtle Borders**: `1px solid #E0E0E0`
- Avoid heavy drop shadows

### 5. Spacing

- **Grid System**: 8px or 12px base unit
- **Minimum Padding**: 16–24px in cards/containers
- **Consistent Gaps**: Use multiples of base unit

### 6. Corners

- **Border Radius**: 12–20px for modern, friendly feel
- Consistency across all interactive elements

---

## 📦 COMPONENT SPECIFICATIONS

### CARD COMPONENT

```css
/* Light Mode */
background: #ffffff;
color: #121212;
border: 1px solid #e0e0e0;
border-radius: 16px;
padding: 24px;
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

/* Dark Mode */
background: #1e1e1e;
color: #ffffff;
border: 1px solid rgba(255, 255, 255, 0.1);
```

**Hover State:**

```css
transform: scale(1.02);
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
/* OR */
border-color: #00b15e; /* Green accent tint */
```

**Accent Variant:**

- Use `border-left: 4px solid #00B15E` for status indicators
- Use `border: 2px solid #FF7A00` for alerts

---

### BENTO BOX COMPONENT

**Tile Layout:**

- Each tile uses one accent + neutral colors
- Maintain consistent spacing grid (16px gaps)
- Subtle motion on hover (scale or tint)

**Example Configurations:**

```
┌─────────────────┬─────────────────┐
│  Green Tile     │  White Tile     │
│  (White text)   │  (Orange head)  │
│  #00B15E        │  #FFFFFF        │
└─────────────────┴─────────────────┘
```

**Green Tile:**

```css
background: #00b15e;
color: #ffffff;
padding: 32px;
border-radius: 20px;
```

**White Tile with Orange Accent:**

```css
background: #ffffff;
color: #121212;
border-radius: 20px;
padding: 32px;

/* Heading */
h3 {
  color: #ff7a00;
}
```

---

### DASHBOARD SCREEN

**Layout:**

- **Background**: `#F9F9F9` (light) or `#121212` (dark)
- **70% Neutral**: Keep most UI in white/black/gray
- **30% Accent**: Strategic use of green/orange

**Accent Usage:**

- ✅ **Green**: Success metrics, progress bars, completion states
- 🔶 **Orange**: Alerts, pending tasks, warnings

**Charts:**

- Use Green and Orange as series colors
- 60% saturation for better readability
- Neutral gray for axes and labels

**Widget Spacing:**

```css
gap: 24px;
padding: 32px;
```

---

### LOGIN / REGISTER SCREENS

**Container:**

```css
/* Dark Mode */
body {
  background: #121212;
}

.form-container {
  background: #ffffff;
  border-radius: 20px;
  padding: 48px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

/* Light Mode */
body {
  background: #ffffff;
}

.form-container {
  background: #121212;
  border-radius: 20px;
  padding: 48px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}
```

**Form Elements:**

**Input Fields:**

```css
/* Light Mode */
background: #f2f2f2;
border: 1px solid #e0e0e0;
border-radius: 12px;
padding: 16px;
color: #121212;

/* Focus State */
outline: 2px solid #00b15e;
box-shadow: 0 0 0 4px rgba(0, 177, 94, 0.1);

/* Dark Mode */
background: #1a1a1a;
border: 1px solid rgba(255, 255, 255, 0.1);
color: #ffffff;
```

**Buttons:**

**Primary Button (Green):**

```css
background: #00b15e;
color: #ffffff;
border: none;
border-radius: 12px;
padding: 16px 32px;
font-weight: 600;
cursor: pointer;
transition: all 0.2s ease;

/* Hover */
background: #009b50;
transform: translateY(-2px);
box-shadow: 0 4px 12px rgba(0, 177, 94, 0.3);
```

**Secondary Link (Orange):**

```css
color: #ff7a00;
text-decoration: underline;
font-weight: 500;

/* Hover */
color: #e66d00;
```

---

## ⚖️ ACCESSIBILITY & CONSISTENCY

### Contrast Requirements

- **Minimum Ratio**: 4.5:1 for normal text
- **Large Text**: 3:1 for 18pt+ or bold 14pt+
- Test all color combinations

### Color Usage Rules

1. **Never mix Green and Orange heavily** in same frame
2. **Use color intentionally** to guide attention, not decorate
3. **Provide non-color indicators** (icons, labels) for states
4. **Test in grayscale** to ensure information hierarchy works

### Motion Guidelines

- **Gentle Transitions**: 200–300ms ease
- **Allowed Effects**: Fade, scale, tint
- **Avoid**: Spinning, bouncing, sliding excessively
- **Respect**: `prefers-reduced-motion` media query

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 🧩 IMPLEMENTATION EXAMPLES

### TailwindCSS Configuration

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        "primary-dark": "#121212",
        "primary-light": "#FFFFFF",
        "accent-green": "#00B15E",
        "accent-orange": "#FF7A00",
        "neutral-gray": "#E0E0E0",
        "dark-card": "#1E1E1E",
        "light-input": "#F2F2F2",
        "dark-input": "#1A1A1A",
      },
      borderRadius: {
        card: "16px",
        bento: "20px",
        input: "12px",
      },
      spacing: {
        card: "24px",
        container: "32px",
        form: "48px",
      },
      boxShadow: {
        soft: "0 2px 8px rgba(0, 0, 0, 0.1)",
        medium: "0 4px 12px rgba(0, 0, 0, 0.15)",
        heavy: "0 8px 24px rgba(0, 0, 0, 0.2)",
        "green-focus": "0 0 0 4px rgba(0, 177, 94, 0.1)",
        "orange-focus": "0 0 0 4px rgba(255, 122, 0, 0.1)",
      },
    },
  },
};
```

### React Component Example

```jsx
// Card.jsx
const Card = ({ children, variant = "default", className = "" }) => {
  const variants = {
    default:
      "bg-white dark:bg-dark-card text-primary-dark dark:text-white border border-neutral-gray",
    green: "bg-accent-green text-white border-2 border-accent-green",
    orange: "bg-white text-primary-dark border-l-4 border-accent-orange",
  };

  return (
    <div
      className={`
      ${variants[variant]}
      rounded-card
      p-card
      shadow-soft
      transition-all duration-200
      hover:scale-[1.02] hover:shadow-medium
      ${className}
    `}
    >
      {children}
    </div>
  );
};

// Button.jsx
const Button = ({ children, variant = "primary", ...props }) => {
  const variants = {
    primary: "bg-accent-green hover:bg-[#009B50] text-white shadow-medium",
    secondary:
      "bg-transparent border-2 border-accent-orange text-accent-orange hover:bg-accent-orange hover:text-white",
  };

  return (
    <button
      className={`
        ${variants[variant]}
        px-8 py-4
        rounded-input
        font-semibold
        transition-all duration-200
        hover:-translate-y-0.5
      `}
      {...props}
    >
      {children}
    </button>
  );
};
```

---

## 📋 COMPONENT CHECKLIST

Before creating or updating a component, verify:

- [ ] Uses only colors from the defined palette
- [ ] One accent color per context (not mixing green/orange)
- [ ] Contrast ratio meets WCAG AA standards (4.5:1)
- [ ] Spacing uses 8px/12px grid system
- [ ] Border radius is 12–20px
- [ ] Shadows are soft (`rgba(0,0,0,0.1)` or lighter)
- [ ] Hover states are subtle (scale, shadow, or tint)
- [ ] Typography hierarchy uses size/weight, not color
- [ ] Respects `prefers-reduced-motion`
- [ ] Works in both light and dark modes

---

## 🎯 SUMMARY

**The Quizda design system is built on:**

1. **Minimal color usage** (Black, White, Green, Orange)
2. **Intentional accents** (one per context)
3. **High contrast** for clarity
4. **Consistent spacing** (8px/12px grid)
5. **Accessible motion** (gentle, reducible)

**Every component should:**

- Feel clean and uncluttered
- Guide user attention purposefully
- Work beautifully in light and dark modes
- Be accessible to all users

---

_This design system is a living document. Update as the product evolves, but maintain the core principles of minimalism, contrast, and intentional color usage._
