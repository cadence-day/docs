# Cadence App Folder Structure

This README explains the purpose of each folder and subfolder in the project:

## /shared
Reusable code and resources shared across the app.

- **/api**: API utilities, service functions, and network logic.
- **/components**: Reusable UI components (buttons, modals, etc.).
- **/context**: React context providers and related logic.
- **/hooks**: Custom React hooks for shared logic.
- **/stores**: State management logic (e.g., Zustand, Redux, etc.).
- **/types**: TypeScript type definitions and interfaces.
- **/utils**: Utility functions and helpers.
- **/i18n**: Internationalization (i18n) resources and translation files.

## /features
Feature-specific modules, each containing its own components, logic, and tests. Organize by domain or functionality.

## /app
Application entry point, global configuration, and top-level layout. May include routing, theme setup, and providers.

---

Feel free to expand this README as the project grows or as new folders are added.
