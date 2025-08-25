# Authentication Feature

This directory contains the authentication system for the Cadence app, built with React Native, Expo, and Clerk.

## 🏗️ Architecture

```
features/auth/
├── components/
│   ├── screens/        # SignIn, SignUp, ForgotPassword
│   └── shared/         # Reusable auth components
└── utils/              # Validation & error handling
```

## 🎯 Core Features

### Authentication Screens

- **SignIn**: Email/password auth with social login (Google, Apple) and form validation
- **SignUp**: Registration with real-time password validation and email verification
- **ForgotPassword**: Password reset flow with email verification

### Form Validation System

- Real-time field validation with visual feedback
- Password strength requirements (10+ chars, uppercase, lowercase, digit, special char)
- Email format validation
- Disabled submit buttons until form is valid

### Error Handling

- **Centralized Clerk Errors**: `utils/errorHandler.ts` parses and maps Clerk errors to form fields
- **Toast Notifications**: Success/error messages via `shared/components/Toast.tsx` and `shared/hooks/useToast.ts`
- **Field-Level Errors**: Individual input validation with `CdTextInput` error prop

## 🔧 Key Utilities

### Password Validation (`utils/PasswordValidation.tsx`)

```typescript
validatePassword(password: string, repeatPassword: string, agreeToTerms: boolean): PasswordValidationResult
```

Returns validation state for all password requirements with boolean flags.

### Error Handler (`utils/errorHandler.ts`)

```typescript
parseClerkErrors(clerkError: any): Record<string, string>
createClerkErrorClearer(): (field: string) => void
```

Centralizes Clerk error parsing and provides field-specific error clearing.

## 🎨 UI Components

### Custom Inputs

- **CdTextInput**: Enhanced text input with error states, icons, and validation
- **CdButton**: Primary/outline button variants with loading states
- **Toast**: Animated notifications with success/error/warning/info types

### Validation Feedback

- **PasswordRequirement**: Visual password requirement indicators
- **Real-time Validation**: Instant feedback as user types
- **Error States**: Red borders and error text for invalid fields

## 🔐 Authentication Flow

### Sign-In Process

1. Form validation (email format, required fields)
2. Clerk authentication with error handling
3. Success: Navigate to main app
4. Error: Display toast notification with specific message

### Sign-Up Process

1. Real-time password validation with visual requirements
2. Email verification step via Clerk
3. Account creation with comprehensive error handling
4. Success state with navigation options

### Password Reset

1. Email validation and submission
2. Clerk password reset email
3. Success confirmation with navigation back to sign-in

## 🚀 Usage

```typescript
// Navigation setup
<Stack.Screen name="sign-in" component={SignInScreen} />
<Stack.Screen name="sign-up" component={SignUpScreen} />
<Stack.Screen name="forgot-password" component={ForgotPasswordScreen} />

// Error handling
const { showError, showSuccess } = useToast();
const errors = parseClerkErrors(clerkError);
```

## 🔒 Security Features

- **Password Complexity**: Enforced 10+ character requirements
- **Email Verification**: Required for account activation
- **OAuth Integration**: Secure Google/Apple authentication
- **Input Validation**: Client-side validation with server-side verification
- **Error Sanitization**: Safe error message display without sensitive data

## 📱 Mobile-First Design

- **Edge-to-Edge Layout**: Full screen gradient backgrounds
- **Touch-Friendly**: 48dp minimum touch targets
- **Responsive**: Adapts to various screen sizes
- **Accessibility**: Proper labels and contrast ratios
- **Loading States**: Visual feedback during authentication

## 🔄 Dependencies

- **Clerk**: Authentication service and user management
- **Expo Router**: File-based navigation
- **React Native**: Core mobile framework
- **TypeScript**: Type safety throughout

## 📚 Best Practices

1. **Centralized Error Handling**: All Clerk errors processed through `errorHandler.ts`
2. **Toast Notifications**: User-friendly error/success messages
3. **Real-time Validation**: Immediate feedback improves UX
4. **Type Safety**: Full TypeScript coverage for auth flows
5. **Component Reusability**: Shared validation and error components

## 🎨 Styling

### Shared Style System (`style.ts`)

All authentication components use a centralized styling system:

- **Consistent Design Language**: Unified colors, spacing, and typography
- **Responsive Layouts**: Edge-to-edge designs that work across devices
- **Component Variants**: Different styles for various button and text types
- **Accessibility**: Proper contrast ratios and touch targets

**Key Style Categories:**

- Container and layout styles
- Form input styling
- Button variants (primary, outline, text)
- Error and success states
- Social button layouts

## 🔧 Utilities

### Password Validation (`utils/PasswordValidation.tsx`)

Centralized password validation logic:

```typescript
export const validatePassword = (
  password: string,
  repeatPassword: string,
  agreeToTerms: boolean
): PasswordValidationResult
```

**Validation Rules:**

- Minimum 10 characters
- At least one lowercase letter
- At least one uppercase letter
- At least one digit
- At least one special character
- Passwords must match
- Terms must be accepted

## 🔐 Authentication Flow

### Sign-In Process

1. User enters email and password
2. Form validation occurs
3. Authentication request sent to Clerk
4. Success: User redirected to main app
5. Failure: Error message displayed

### Sign-Up Process

1. User fills registration form
2. Password validation with real-time feedback
3. Account creation via Clerk
4. Email verification sent
5. User enters verification code
6. Account activation and success state

### Social Authentication

- Google OAuth integration
- Apple Sign-In support
- Seamless browser handling for mobile

## 🚀 Usage

### Basic Implementation

```typescript
import SignInScreen from '@/features/auth/components/screens/SignIn';
import SignUpScreen from '@/features/auth/components/screens/SignUp';

// In your navigation
<Stack.Screen name="sign-in" component={SignInScreen} />
<Stack.Screen name="sign-up" component={SignUpScreen} />
```

### Customization

The auth system is designed to be easily customizable:

- **Styling**: Modify `style.ts` for theme changes
- **Validation**: Extend `PasswordValidation.tsx` for custom rules
- **Components**: Replace shared components with custom implementations
- **Flow**: Modify screen logic for different authentication requirements

## 🔒 Security Features

- **Password Requirements**: Enforced complexity rules
- **Email Verification**: Required account activation
- **OAuth Integration**: Secure social authentication
- **Session Management**: Proper authentication state handling
- **Input Validation**: Client-side and server-side validation

## 📱 Mobile-First Design

- **Edge-to-Edge Layout**: Full screen utilization
- **Touch-Friendly**: Proper button sizes and spacing
- **Responsive**: Adapts to different screen sizes
- **Accessibility**: Screen reader support and proper contrast

## 🧪 Testing

The authentication system is designed for easy testing:

- **Component Isolation**: Each component can be tested independently
- **Utility Functions**: Pure functions for validation logic
- **Mock Data**: Easy to mock Clerk responses
- **State Management**: Predictable state changes

## 🔄 Dependencies

- **React Native**: Core framework
- **Expo**: Development platform and tools
- **Clerk**: Authentication service
- **Expo Router**: Navigation
- **Linear Gradient**: Background styling
- **Vector Icons**: UI icons

## 📚 Best Practices

1. **Component Reusability**: Use shared components for consistency
2. **Style Centralization**: All styles in `style.ts`
3. **Error Handling**: Comprehensive error states and user feedback
4. **Accessibility**: Proper ARIA labels and touch targets
5. **Performance**: Optimized re-renders and state management

## 🚧 Development Notes

- All components use TypeScript for type safety
- Styles are organized by component and functionality
- Error boundaries handle authentication failures gracefully
- Loading states provide user feedback during operations
- Responsive design ensures cross-device compatibility

## 🔮 Future Enhancements

- **Biometric Authentication**: Face ID, Touch ID support
- **Multi-Factor Authentication**: SMS, authenticator app support
- **Passwordless Login**: Magic link authentication
- **Advanced Security**: Rate limiting, suspicious activity detection
- **Analytics**: User behavior tracking and insights
