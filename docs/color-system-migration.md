# Color System Migration Guide

This document outlines the migration from hardcoded colors to the centralized, theme-aware color system.

## New Color System Structure

### 1. Organized Color Categories

```typescript
COLORS = {
  // Brand Colors - Primary app identity colors
  brand: {
    primary: "#6646EC",
    secondary: "#B7B7B7",
    tertiary: "#FF6B5C",
    // ...
  },

  // Semantic Colors - Meaning-based colors
  semantic: {
    error: "#EF4444",
    success: "#00B894",
    warning: "#FFB347",
    info: "#3498DB",
    destructive: "#FF3B30",
  },

  // Theme-aware colors
  light: {
    /* ... */
  },
  dark: {
    /* ... */
  },
};
```

### 2. Theme-Aware Usage

```typescript
// Using the hooks
const backgroundColor = useNestedThemeColor("background.primary");
const textColor = useNestedThemeColor("text.primary");
const brandColor = useBrandColor("primary");
const errorColor = useSemanticColor("error");

// Creating theme-aware styles
function createStyles(colorScheme: "light" | "dark") {
  return StyleSheet.create({
    container: {
      backgroundColor: COLORS[colorScheme].background.primary,
      borderColor: COLORS[colorScheme].ui.border,
    },
    text: {
      color: COLORS[colorScheme].text.primary,
    },
    button: {
      backgroundColor: COLORS.brand.primary, // Brand colors are theme-independent
    },
  });
}
```

## Migration Examples

### Before (Hardcoded Colors)

```typescript
const styles = StyleSheet.create({
  container: {
    backgroundColor: "#1a1a1a",
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  text: {
    color: "#FFFFFF",
  },
  errorText: {
    color: "#EF4444",
  },
  button: {
    backgroundColor: "#6646EC",
  },
});
```

### After (Centralized & Theme-Aware)

```typescript
function createStyles(colorScheme: "light" | "dark") {
  return StyleSheet.create({
    container: {
      backgroundColor: COLORS[colorScheme].background.secondary,
      borderColor: COLORS[colorScheme].ui.border,
    },
    text: {
      color: COLORS[colorScheme].text.primary,
    },
    errorText: {
      color: COLORS.semantic.error,
    },
    button: {
      backgroundColor: COLORS.brand.primary,
    },
  });
}

// Usage in component
const colorScheme = useColorScheme() ?? "light";
const styles = createStyles(colorScheme);
```

## Common Migration Patterns

### 1. Hardcoded White/Black Text

```typescript
// Before
color: "#FFFFFF";
color: "#000000";

// After
color: COLORS[colorScheme].text.primary; // Auto-adapts to theme
color: COLORS[colorScheme].text.inverse; // For contrasting text
```

### 2. Hardcoded Backgrounds

```typescript
// Before
backgroundColor: "#1a1a1a";
backgroundColor: "rgba(0, 0, 0, 0.5)";

// After
backgroundColor: COLORS[colorScheme].background.secondary;
backgroundColor: COLORS[colorScheme].background.overlay;
```

### 3. Hardcoded Brand Colors

```typescript
// Before
color: "#6646EC";
borderColor: "#EF4444";

// After
color: COLORS.brand.primary;
borderColor: COLORS.semantic.error;
```

### 4. Hardcoded Interactive States

```typescript
// Before
backgroundColor: "rgba(255, 255, 255, 0.1)"; // hover state

// After
backgroundColor: COLORS[colorScheme].interactive.hover;
```

## Available Color Paths

### Background Colors

- `background.primary` - Main app background
- `background.secondary` - Cards, modals
- `background.tertiary` - Sections, dividers
- `background.overlay` - Modal overlays

### Text Colors

- `text.primary` - Main text
- `text.secondary` - Subtitles, secondary text
- `text.tertiary` - Placeholder text, disabled
- `text.inverse` - Text on dark/light contrasting backgrounds
- `text.link` - Link text

### UI Element Colors

- `ui.border` - Borders, dividers
- `ui.borderSubtle` - Subtle borders
- `ui.icon` - Default icons
- `ui.iconActive` - Active/selected icons
- `ui.disabled` - Disabled states
- `ui.shadow` - Shadow color

### Interactive States

- `interactive.hover` - Hover states
- `interactive.pressed` - Pressed states
- `interactive.focus` - Focus states

### Brand Colors (Theme-Independent)

- `brand.primary` - Main brand color
- `brand.secondary` - Secondary brand color
- `brand.tertiary` - Accent color

### Semantic Colors (Theme-Independent)

- `semantic.error` - Error states
- `semantic.success` - Success states
- `semantic.warning` - Warning states
- `semantic.info` - Information states
- `semantic.destructive` - Destructive actions

## Utility Functions

### getThemedColor()

```typescript
const color = getThemedColor("text.primary", "dark");
```

### createThemedStyles()

```typescript
const styles = createThemedStyles(
  {
    backgroundColor: "background.primary",
    color: "text.primary",
    borderColor: "ui.border",
  },
  colorScheme
);
```

## Best Practices

1. **Always use theme-aware colors** for UI elements that should adapt to light/dark mode
2. **Use brand colors** for elements that should maintain brand identity across themes
3. **Use semantic colors** for status indicators, errors, warnings, etc.
4. **Create styles functions** that accept colorScheme parameter for dynamic theming
5. **Use the provided hooks** (`useNestedThemeColor`, `useBrandColor`, `useSemanticColor`) in components
6. **Test both light and dark themes** to ensure proper contrast and accessibility

## Files to Update

The following files contain hardcoded colors that need migration:

### High Priority (Core Components)

- `shared/components/styles.ts` ✅ (completed)
- `shared/components/CadenceUI/styles.ts` (in progress)
- `shared/utils/shadowUtils.ts` ✅ (completed)
- `shared/components/Toast.tsx` ✅ (completed)

### Medium Priority (Feature Components)

- `shared/components/CadenceUI/CdDialog.tsx`
- `shared/components/CadenceUI/CdDialogHeader.tsx`
- `shared/components/CadenceUI/CdMoodSelector.tsx`
- `shared/components/CadenceUI/CdLevelIndicator.tsx`

### Low Priority (Specific Screens)

- `app/(utils)/no-internet.tsx`
- `shared/auth/components/screens/SignUp.tsx`
- Various test files

Use this guide to systematically replace hardcoded colors throughout the codebase.
