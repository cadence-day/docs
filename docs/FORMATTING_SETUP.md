# Code Formatting and Linting Setup

This project is now configured with Prettier and ESLint for consistent code formatting and quality.

## Tools Configured

### Prettier

- **Configuration**: `.prettierrc`
- **Ignore file**: `.prettierignore`
- **Purpose**: Automatic code formatting

### ESLint

- **Configuration**: `eslint.config.mjs` (ESLint v9 format)
- **Purpose**: Code linting and quality checks
- **Integration**: Works with Prettier to avoid conflicts

### VS Code Integration

- **Settings**: `.vscode/settings.json`
- **Features**: Format on save, auto-fix ESLint issues, organize imports

## Available Scripts

```bash
# Format all files with Prettier
npm run format

# Check formatting without fixing
npm run format:check

# Run ESLint on all files
npm run lint

# Run ESLint and auto-fix issues
npm run lint:fix
```

## Usage

### Formatting Files

```bash
# Format everything
npm run format

# Check if files need formatting
npm run format:check
```

### Linting Files

```bash
# Lint everything
npm run lint

# Lint and fix issues automatically
npm run lint:fix

# Lint specific files
npx eslint path/to/file.tsx
```

### VS Code Integration

If you have the Prettier and ESLint extensions installed:

- Files will auto-format on save
- ESLint issues will be auto-fixed on save
- Import statements will be organized automatically

## Configuration Details

### Prettier Rules

- Semi-colons: Yes
- Single quotes: No (double quotes)
- Trailing commas: ES5 compatible
- Tab width: 2 spaces
- Print width: 80 characters

### ESLint Rules

- TypeScript support
- React/React Native rules
- Prettier integration
- Unused variable detection
- Console statement warnings (allows warn/error)

## Recommended VS Code Extensions

- [Prettier - Code formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)

## Notes

- The configuration excludes generated files and build directories
- Test files have appropriate Jest globals configured
- Deno globals are configured for Supabase functions
