// eslint.config.js
module.exports = [
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        __DEV__: "readonly",
        console: "readonly",
        global: "readonly",
        require: "readonly",
        module: "readonly",
        process: "readonly",
        Buffer: "readonly",
        FormData: "readonly",
        fetch: "readonly",
        navigator: "readonly",
        window: "readonly",
        document: "readonly",
      },
    },
    plugins: {
      react: require("eslint-plugin-react"),
      "react-hooks": require("eslint-plugin-react-hooks"),
      "react-native": require("eslint-plugin-react-native"),
    },
    rules: {
      // Core JavaScript/TypeScript rules
      "no-console": "warn",
      "no-debugger": "error",
      "prefer-const": "error",
      "no-var": "error",
      "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "no-duplicate-imports": "error",
      "no-unused-expressions": "error",
      "no-nested-ternary": "warn",
      "no-unneeded-ternary": "error",

      // React rules
      "react/jsx-uses-react": "error",
      "react/jsx-uses-vars": "error",
      "react/react-in-jsx-scope": "off", // Not needed in React 17+
      "react/prop-types": "off", // Using TypeScript for prop validation
      "react/display-name": "off",

      // React Hooks rules
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      // React Native rules
      "react-native/no-unused-styles": "error",
      "react-native/split-platform-components": "warn",
      "react-native/no-inline-styles": "warn",
      "react-native/no-color-literals": "off", // Allow color literals for simplicity
      "react-native/no-raw-text": "off", // Allow raw text in some cases
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: require("@typescript-eslint/parser"),
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        ecmaVersion: 2021,
        sourceType: "module",
        project: "./tsconfig.json",
      },
    },
    plugins: {
      "@typescript-eslint": require("@typescript-eslint/eslint-plugin"),
      react: require("eslint-plugin-react"),
      "react-hooks": require("eslint-plugin-react-hooks"),
      "react-native": require("eslint-plugin-react-native"),
    },
    rules: {
      // Override base rules for TypeScript
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-var-requires": "off",

      // React rules for TypeScript files
      "react/jsx-uses-react": "error",
      "react/jsx-uses-vars": "error",
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react/display-name": "off",

      // React Hooks rules
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      // React Native rules
      "react-native/no-unused-styles": "error",
      "react-native/split-platform-components": "warn",
      "react-native/no-inline-styles": "warn",
      "react-native/no-color-literals": "off",
      "react-native/no-raw-text": "off",
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
  {
    files: [
      "*.config.js",
      "*.config.ts",
      "babel.config.js",
      "metro.config.js",
      "eslint.config.js",
    ],
    rules: {
      "no-console": "off",
      "@typescript-eslint/no-var-requires": "off",
    },
  },
  {
    files: ["**/__tests__/**/*", "**/*.test.*", "**/*.spec.*"],
    languageOptions: {
      globals: {
        jest: "readonly",
        describe: "readonly",
        it: "readonly",
        expect: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        beforeAll: "readonly",
        afterAll: "readonly",
      },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "no-console": "off",
    },
  },
  {
    files: ["scripts/**/*"],
    rules: {
      "no-console": "off",
      "@typescript-eslint/no-var-requires": "off",
    },
  },
  {
    files: ["shared/utils/errorHandler.ts"],
    rules: {
      "no-console": "off", // Allow console statements in error handler
    },
  },
  {
    ignores: [
      "node_modules/",
      "android/",
      "ios/",
      ".expo/",
      "dist/",
      "build/",
      "web-build/",
      "*.d.ts",
      "shared/types/database.types.ts",
      "coverage/",
      ".metro-health-check*",
      "*.tsbuildinfo",
      "logs/",
      "tmp/",
      "temp/",
      "sentry.properties",
      "LEGACY_*",
    ],
  },
];
