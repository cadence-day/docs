# Authentication (Auth)

Compact overview of the Cadence app authentication module (React Native + Expo + Clerk).

## Structure

shared/auth/

- components/
  - screens/ (SignIn, SignUp, ForgotPassword, PasswordReset)
  - shared/ (reusable inputs)
- utils/ (validation, Clerk error parsing, constants with password requirements)
- style/ (shared styles elements)

## What it provides

- Email/password sign-in and sign-up with social OAuth (Google, Apple).
- Real-time password validation and visual requirements.
- Email verification and 6‑digit code flows for signup & password reset.
- Centralized Clerk error parsing and toast notifications.

## Key components

- `CdTextInput` — reusable input with error state.
- `PasswordRequirement` — visual checklist for password rules.
- `CdButton` / `Toast` — consistent actions and feedback.

## Validation & Security

- Password rules:
  - min 10 chars,
  - uppercase,
  - lowercase,
  - digit,
  - special char.
- Client-side validation with server-side confirmation via Clerk.
- Errors sanitized and mapped to fields for clear UX.

## Usage (examples)

Add auth screens to navigation:

```tsx
import SignInScreen from '@/features/auth/components/screens/SignIn';
import SignUpScreen from '@/features/auth/components/screens/SignUp';

// router or navigator
<Stack.Screen name="sign-in" component={SignInScreen} />
<Stack.Screen name="sign-up" component={SignUpScreen} />
```

Use utilities:

```ts
const { showError, showSuccess } = useToast();
const errors = parseClerkErrors(clerkError);
```

## Developer notes

- Follow existing style and component patterns in `shared/auth/components`.
- Extend `utils/validation.ts` to change password or any other rules.
- Tests: components are isolated and utilities are pure for easy unit testing.

## Future

- Biometric & MFA, passwordless/magic links.

---

This README is intentionally concise — see individual files under `shared/auth` for implementation details.
