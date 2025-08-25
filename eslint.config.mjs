import js from "@eslint/js";
import typescript from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";
import prettier from "eslint-plugin-prettier";
import react from "eslint-plugin-react";

export default [
  js.configs.recommended,
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        ecmaVersion: 2020,
        sourceType: "module",
      },
      globals: {
        // Node.js globals
        console: "readonly",
        process: "readonly",
        global: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        module: "readonly",
        require: "readonly",
        exports: "readonly",
        Buffer: "readonly",

        // Jest globals
        describe: "readonly",
        it: "readonly",
        test: "readonly",
        expect: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        beforeAll: "readonly",
        afterAll: "readonly",
        jest: "readonly",

        // Browser/Node.js globals
        window: "readonly",
        document: "readonly",
        localStorage: "readonly",
        sessionStorage: "readonly",
        fetch: "readonly",
        Response: "readonly",
        Request: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",

        // Deno globals (for supabase functions)
        Deno: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": typescript,
      prettier,
      react,
    },
    rules: {
      // Prettier rules
      "prettier/prettier": "error",

      // React rules
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",

      // TypeScript rules
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-explicit-any": "warn",

      // General rules
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "prefer-const": "error",
      "no-var": "error",
      "no-unused-vars": "off", // Use TypeScript version instead
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
  {
    ignores: [
      "node_modules/",
      "dist/",
      "build/",
      ".expo/",
      ".expo-shared/",
      "**/database.types.ts",
      "ios/Pods/",
      "ios/build/",
      "ios/*.xcworkspace",
      "ios/*.xcuserdata",
      "android/.gradle/",
      "android/app/build/",
      "android/build/",
      "android/gradle/",
      "android/gradlew",
      "android/gradlew.bat",
      "web-build/",
      "*.jks",
      "*.p8",
      "*.p12",
      "*.key",
      "*.mobileprovision",
      ".metro-health-check*",
      "*.log",
      "babel.config.js",
      "metro.config.js",
      "jest.config.js",
      "coverage/",
    ],
  },
];
