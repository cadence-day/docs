# Debug Container Styling System

This system provides a way to easily toggle magenta borders on all containers across the app for debugging layout issues.

## Setup

The debug styling system is located in `/shared/constants/isDev.ts` and provides:

- `DEBUG_CONTAINER_STYLING`: Main toggle for enabling/disabling debug borders
- Pre-defined debug styles: `debugContainerStyle`, `debugContainerStyleThick`, `debugContainerStyleDashed`
- Utility functions: `withDebugBorder()`, `withDebugBorderThick()`, `withDebugBorderDashed()`

## How to Enable

1. Open `/shared/constants/isDev.ts`
2. Change `DEBUG_CONTAINER_STYLING = false && isDev;` to `DEBUG_CONTAINER_STYLING = true && isDev;`
3. Reload your app - all containers using the debug utilities will now show magenta borders

## Usage Patterns

### 1. Wrap existing styles with debug utilities:

```typescript
import {
  withDebugBorder,
  withDebugBorderThick,
  withDebugBorderDashed,
} from "@/shared/constants/isDev";

export const styles = StyleSheet.create({
  // Main containers - use thick borders
  mainContainer: withDebugBorderThick({
    flex: 1,
    padding: 16,
  }),

  // Regular containers - use normal borders
  itemContainer: withDebugBorder({
    backgroundColor: "white",
    borderRadius: 8,
  }),

  // Nested containers - use dashed borders for distinction
  nestedContainer: withDebugBorderDashed({
    marginVertical: 8,
    paddingHorizontal: 12,
  }),
});
```

### 2. Apply directly to components:

```typescript
import { debugContainerStyle } from "@/shared/constants/isDev";

<View style={[styles.myContainer, debugContainerStyle]}>
  {/* Your content */}
</View>
```

### 3. Conditional application:

```typescript
import { DEBUG_CONTAINER_STYLING } from "@/shared/constants/isDev";

<View
  style={[
    styles.container,
    DEBUG_CONTAINER_STYLING && { borderWidth: 1, borderColor: "magenta" }
  ]}
>
  {/* Your content */}
</View>
```

## Border Types

- **Normal Border** (`withDebugBorder`): 1px solid magenta - for general containers
- **Thick Border** (`withDebugBorderThick`): 2px solid magenta - for main layout containers
- **Dashed Border** (`withDebugBorderDashed`): 1px dashed magenta - for nested/inner containers

## Best Practices

1. **Use thick borders** for main layout containers (screens, sections)
2. **Use normal borders** for content containers (cards, items)
3. **Use dashed borders** for nested containers to create visual hierarchy
4. **Always wrap existing styles** rather than replacing them
5. **Remember to disable** before production builds (it's automatically disabled when `__DEV__` is false)

## Example Implementation

See `/features/timeline/styles.ts` for a working example of how the debug styling is applied to timeline components.

## Performance Notes

- When `DEBUG_CONTAINER_STYLING` is `false`, the utility functions return empty objects
- This adds minimal overhead and can be safely left in production code
- The debug flag is automatically disabled when `__DEV__` is false
