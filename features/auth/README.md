# Authentication Feature

This directory contains the authentication system for the Cadence app, built with React Native, Expo, and Clerk.

## 🏗️ Architecture

The authentication system follows a modular architecture with clear separation of concerns:

```
features/auth/
├── components/          # UI components
│   ├── screens/        # Main authentication screens
│   ├── shared/         # Reusable components
│   └── dialogs/        # Modal dialogs
├── hooks/              # Custom React hooks
├── services/           # API and external service integrations
├── utils/              # Utility functions and validation
└── style.ts            # Shared styles for all auth components
```

## 🎯 Components

### Screens

#### SignInScreen (`components/screens/SignIn.tsx`)
The main sign-in interface that provides:
- Email and password authentication
- Social login options (Google, Apple)
- Forgot password functionality
- Navigation to sign-up

**Features:**
- Form validation
- OAuth integration with Clerk
- Responsive design with edge-to-edge layout
- Error handling and user feedback

#### SignUpScreen (`components/screens/SignUp.tsx`)
Complete sign-up flow including:
- User registration form
- Password validation with requirements
- Email verification
- Terms and conditions acceptance

**Features:**
- Multi-step registration process
- Real-time password validation
- Email verification flow
- Success state handling

### Shared Components

#### DirectToSignUp (`components/shared/DirectToSignUp.tsx`)
Reusable component for navigation between auth screens.

#### DirectToSignIn (`components/shared/DirectToSignIn.tsx`)
Reusable component for navigation back to sign-in.

#### PasswordRequirement (`components/shared/PasswordRequirement.tsx`)
Displays password validation requirements with visual feedback.

#### TermsAndPrivacy (`components/shared/TermsAndPrivacy.tsx`)
Terms and conditions acceptance component.

#### EmailVerification (`components/shared/EmailVerification.tsx`)
Email verification code input component.

#### SignUpSuccess (`components/shared/SignUpSuccess.tsx`)
Success state display after successful registration.

### Dialogs

#### ForgotPasswordDialog (`components/dialogs/ForgotPassword/`)
Modal dialog for password recovery functionality.

#### SignupDialog (`components/dialogs/SignupDialog/`)
Modal dialog for quick sign-up actions.

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
