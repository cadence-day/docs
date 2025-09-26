# Task: Remove Deprecated SafeAreaView Usage (Expo SDK 54)

## Context

- **Issue:** `SafeAreaView` from `react-native` is deprecated in Expo SDK 54.
- **Goal:** Refactor the codebase to use `SafeAreaView` from `react-native-safe-area-context` instead.

## Files to Update

Update all usages of `SafeAreaView` in the following files:

- `shared/components/CadenceUI/ScreenHeader.tsx`
- `app/(home)/profile.tsx`

## Instructions

1. **Update Imports**
   - Replace any import of `SafeAreaView` from `react-native` with:
     ```ts
     import { SafeAreaView } from "react-native-safe-area-context";
     ```
   - Remove `SafeAreaView` from any `react-native` import statements.

2. **Update Usage**
   - Ensure all `<SafeAreaView>` components in the above files use the new import.
   - No changes to props or usage are needed unless you see TypeScript errors.

3. **Dependencies**
   - If `react-native-safe-area-context` is not installed, add it with:
     ```
     npx expo install react-native-safe-area-context
     ```

4. **Testing**
   - Verify that the UI still respects device safe areas on both iOS and Android.
   - Pay special attention to the `ScreenHeader` and `profile` screen.

5. **Code Quality**
   - Ensure there are no TypeScript or lint errors related to `SafeAreaView`.
   - Follow project code style and commit conventions.

## Acceptance Criteria

- No usage of `SafeAreaView` from `react-native` remains.
- All affected screens render correctly with the new safe area handling.
- All tests and lint checks pass.
