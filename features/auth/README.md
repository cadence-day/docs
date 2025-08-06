# Auth Feature - Clean Structure

## Overview

The authentication feature has been completely reorganized and simplified with a clean, maintainable structure.

## New Structure

```
features/auth/
├── index.ts                     # Main exports
├── hooks/
│   ├── useAuth.ts              # Main auth hook with all logic
│   └── useAuthStore.ts         # Zustand store
├── services/
│   ├── auth-api.ts             # Supabase API calls
│   ├── session.ts              # Session management
│   └── deep-links.ts           # Deep link handling
├── components/
│   ├── index.ts                # Component exports
│   ├── AuthProvider.tsx        # Simple provider component
│   ├── AuthModalRouter.tsx     # Modal routing
│   ├── AuthErrorBoundary.tsx   # Error boundary (legacy)
│   ├── shared/                 # Shared UI components
│   │   ├── index.ts
│   │   ├── AuthInput.tsx
│   │   ├── PasswordStrengthIndicator.tsx
│   │   └── LoadingScreen.tsx
│   └── dialogs/                # Modal dialogs
│       ├── index.ts
│       ├── LoginDialog.tsx
│       ├── SignupDialog.tsx
│       ├── ResetPasswordDialog.tsx
│       ├── MagicLinkDialog.tsx
│       ├── OTPVerificationDialog.tsx
│       └── DeleteUserDialog.tsx
└── utils/
    ├── constants.ts            # Auth constants
    ├── types.ts                # Simplified types
    └── validation.ts           # Form validation
```

## Key Simplifications

### 1. Single Hook Pattern

- `useAuth()` hook provides all authentication functionality
- No need for separate context provider with complex state
- All auth logic is encapsulated in the hook

### 2. Simplified State Management

- Clean Zustand store with minimal state
- No complex modal routing state
- Clear separation of concerns

### 3. Service Layer

- `auth-api.ts`: All Supabase authentication calls
- `session.ts`: Session persistence and restoration
- `deep-links.ts`: Deep link handling logic

### 4. Clean Component Structure

- Shared components for reusable UI elements
- Dialog components for modal flows
- Simple provider that just wraps children

### 5. Type Safety

- Simplified type definitions
- Clear interfaces for forms and responses
- Consistent error handling types

## Usage

### Basic Setup

```tsx
import { AuthProvider, useAuth, AuthModalRouter } from "@/features/auth";

function App() {
  return (
    <AuthProvider>
      <YourAppContent />
      <AuthModalRouter />
    </AuthProvider>
  );
}
```

### Using Auth in Components

```tsx
function MyComponent() {
  const { user, isLoading, login, logout, signup, resetPassword } = useAuth();

  if (isLoading) return <LoadingScreen />;
  if (!user) return <div>Please log in</div>;

  return <div>Welcome, {user.name}!<\/div>;
}
```

### Form Validation

```tsx
import { validateLoginForm } from "@/features/auth";

const form = { email: "user@example.com", password: "password123" };
const validation = validateLoginForm(form);

if (!validation.isValid) {
  console.log(validation.errors);
}
```

## Benefits

1. **Cleaner Code**: Removed duplicate logic and complex state management
2. **Better Organization**: Clear separation of concerns with service layers
3. **Easier Testing**: Isolated functions and clear interfaces
4. **Better Performance**: Reduced re-renders and optimized state updates
5. **Maintainability**: Easier to modify and extend individual parts
6. **Type Safety**: Comprehensive TypeScript support throughout

## Migration Notes

- Old context-based auth is completely replaced
- All auth logic now goes through the `useAuth()` hook
- Modal routing is simplified and automatic
- Session management is more robust and handles edge cases
- Deep link handling is centralized and reliable

The auth system is now production-ready with a clean, maintainable structure that follows React best practices.
