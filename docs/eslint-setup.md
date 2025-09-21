# ESLint Configuration for Cadence.day

This document describes the ESLint setup for the Cadence.day React Native/Expo TypeScript project.

## Overview

ESLint has been configured to provide comprehensive code quality checking for:

- **TypeScript/JavaScript** files with proper type checking
- **React/React Native** components with hooks validation
- **Expo-specific** patterns and best practices
- **Test files** with Jest-specific rules
- **Configuration files** with relaxed rules where appropriate

## Configuration Files

### `eslint.config.js`

The main ESLint configuration using the new ESLint v9 flat config format. Key features:

- Separate rules for TypeScript and JavaScript files
- React and React Native specific linting
- Special handling for test files, config files, and scripts
- Custom rule overrides for specific files (like error handlers)

## Installed Dependencies

The following ESLint packages have been installed:

```bash
npm install --save-dev \
  eslint \
  @typescript-eslint/parser \
  @typescript-eslint/eslint-plugin \
  eslint-plugin-react \
  eslint-plugin-react-native \
  eslint-plugin-react-hooks \
  eslint-config-expo \
  eslint-plugin-expo \
  @eslint/eslintrc
```

## Available Commands

### Lint Check

```bash
npm run lint
```

Checks all TypeScript/JavaScript files for ESLint violations.

### Lint Fix

```bash
npm run lint:fix
```

Automatically fixes ESLint violations that can be auto-corrected.

### VS Code Tasks

- **Lint: Check** - Run ESLint check
- **Lint: Fix** - Run ESLint with auto-fix

## Key Rules Applied

### TypeScript Rules

- `@typescript-eslint/no-unused-vars` - Prevent unused variables (except those starting with `_`)
- `@typescript-eslint/no-explicit-any` - Warn when using `any` type
- `@typescript-eslint/no-var-requires` - Allow `require()` statements

### React/React Native Rules

- `react-hooks/rules-of-hooks` - Enforce hooks rules
- `react-hooks/exhaustive-deps` - Check effect dependencies
- `react-native/no-unused-styles` - Prevent unused StyleSheet styles
- `react-native/split-platform-components` - Warn about platform-specific components
- `react-native/no-inline-styles` - Discourage inline styles

### Code Quality Rules

- `prefer-const` - Use const when variables are not reassigned
- `no-var` - Disallow var declarations
- `no-console` - Warn about console statements (except in specific files)
- `no-debugger` - Disallow debugger statements
- `no-duplicate-imports` - Prevent duplicate imports
- `no-nested-ternary` - Discourage nested ternary expressions

## File-Specific Overrides

### Configuration Files

Files like `*.config.js`, `babel.config.js`, `metro.config.js`:

- Allow console statements
- Allow `require()` statements

### Test Files

Files in `__tests__`, `*.test.*`, `*.spec.*`:

- Allow `any` types
- Allow console statements
- Include Jest globals

### Error Handler

`shared/utils/errorHandler.ts`:

- Allow console statements (needed for error logging)

### Scripts

Files in `scripts/` directory:

- Allow console statements
- Allow `require()` statements

## Ignored Files and Directories

The following are excluded from linting:

- `node_modules/`
- `android/` and `ios/` (native platform code)
- `.expo/` (Expo build artifacts)
- `dist/`, `build/`, `web-build/` (build outputs)
- `*.d.ts` (TypeScript declaration files)
- `shared/types/database.types.ts` (auto-generated)
- `coverage/` (test coverage reports)
- Build and cache files

## Current Status

After setup, ESLint found:

- **138 errors** - Issues that need manual fixing
- **166 warnings** - Suggestions for code improvements

Most common issues:

1. **Unused variables** - Variables declared but not used
2. **Any types** - Usage of `any` instead of specific types
3. **Nested ternary expressions** - Complex conditional logic
4. **Unused imports** - Imported modules not being used

## Recommendations

### For Development

1. **Enable ESLint in VS Code** - Install the ESLint extension for real-time feedback
2. **Fix errors gradually** - Address ESLint errors in small batches
3. **Run lint before commits** - Use `npm run lint` as part of your development workflow
4. **Use auto-fix when possible** - Run `npm run lint:fix` to automatically resolve simple issues

### For Code Quality

1. **Replace `any` types** - Use specific TypeScript types instead of `any`
2. **Remove unused variables** - Clean up unused imports and variables
3. **Simplify complex expressions** - Break down nested ternary operations
4. **Follow React hooks rules** - Ensure proper dependency arrays in useEffect

## Integration with Existing Workflow

ESLint integrates with your existing development tools:

- **TypeScript checking** - Complements `npm run typescript`
- **Prettier formatting** - Works alongside `npm run format`
- **Testing** - Provides additional checks for test files
- **VS Code** - Real-time linting with ESLint extension

## Next Steps

1. **Install VS Code ESLint extension** for real-time feedback
2. **Gradually fix existing issues** starting with errors
3. **Consider adding pre-commit hooks** to run ESLint automatically
4. **Customize rules** as needed for your team's preferences

The ESLint configuration is now ready to help maintain code quality across your React Native/Expo TypeScript project!
