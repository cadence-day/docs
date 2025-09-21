# Profile Feature Implementation Overview

## Feature Summary

A comprehensive user profile and settings management system for the Cadence.day mobile app, built with React Native, TypeScript, Expo Router, and Clerk authentication. The feature includes profile editing, notification preferences, subscription management, security settings, and intelligent activity suggestions based on user personas.

## Architecture Overview

### Feature Structure

```
features/profile/
├── components/
│   ├── ProfileScreen.tsx
│   ├── ProfileImagePicker.tsx
│   ├── TimePickerDialog.tsx
│   ├── NotificationSettings.tsx
│   ├── SubscriptionPlans.tsx
│   ├── SecuritySettings.tsx
│   └── CustomerSupportDialog.tsx
├── dialogs/
│   ├── ProfileImagePickerDialog.tsx
│   ├── TimePickerDialog.tsx
│   ├── SubscriptionPlansDialog.tsx
│   └── CustomerSupportDialog.tsx
├── hooks/
│   ├── useProfile.ts
│   ├── usePersonaDetection.ts
│   └── useActivitySuggestions.ts
├── services/
│   ├── PersonaService.ts
│   ├── ActivitySuggestionService.ts
│   └── ProfileSyncService.ts
├── stores/
│   └── useProfileStore.ts
├── types.ts
├── styles.ts
└── index.ts
```

## Key Components

### 1. ProfileScreen

- Main profile interface with user information
- Navigation to sub-screens and dialogs
- Integration with Clerk user data
- App version and user ID display

### 2. Dialog System Integration

- Uses CdDialog with DialogHost registry pattern
- Modular dialogs for time picking, subscriptions, and support
- Proper cleanup and state management

### 3. Persona-Based Activity Suggestions

- Automatic persona detection based on sleep/wake times
- Localized activity suggestions
- Rest activity creation for sleep periods
- Integration with existing activity management

## Core Features

### Profile Management

- Profile photo editing with image picker
- User information display (name, username, email, phone)
- Integration with Clerk authentication
- Real-time data synchronization

### Time Management

- Wake/sleep time configuration
- Custom time picker component
- Rest activity auto-creation
- Integration with notification scheduling

### Subscription Management

- Free and Deep Cadence plan display
- Integration with Clerk billing (future implementation)
- Feature access control
- Upgrade flow management

### Security & Privacy

- Two-factor authentication settings
- Data protection options
- Privacy policy access
- Account deletion with data export

### Customer Support

- Integrated with Sentry for issue tracking
- Support request categorization
- User context collection (app version, user ID)
- Error reporting with proper context

## Data Models

### Profile Data

```typescript
interface ProfileFormData {
  name: string;
  username: string;
  email: string;
  phoneNumber?: string;
  avatarUrl?: string;
}
```

### Settings

```typescript
interface ProfileSettings {
  wakeTime: string; // "07:30"
  sleepTime: string; // "23:30"
  notifications: {
    morningReminders: boolean;
    eveningReminders: boolean;
    weeklyStreaks: boolean;
  };
  subscriptionPlan: "free" | "deep_cadence";
}
```

### User Persona

```typescript
interface UserPersona {
  type: "early_bird" | "night_owl" | "balanced" | "flexible";
  suggestedActivities: string[];
  locale: string;
}
```

## Integration Points

### External Services

- **Clerk**: Authentication, user management, billing (future)
- **Sentry**: Error tracking, customer support integration
- **Expo**: Image picker, constants, router
- **Supabase**: Profile data persistence

### Internal Systems

- **Activity Management**: Rest activity creation, suggestions
- **Dialog System**: CdDialog with registry pattern
- **Error Handling**: GlobalErrorHandler integration
- **Internationalization**: useI18n hook
- **State Management**: Zustand stores

## Navigation Flow

```
Profile Screen (main)
├── Time Picker Dialog (wake/sleep times)
├── Notifications Screen (/profile/notifications)
├── Subscription Plans Dialog
├── Security Settings Screen (/profile/security)
└── Customer Support Dialog
```

## Development Guidelines

### Code Organization

- Follow feature-based architecture
- Use TypeScript interfaces for all data
- Implement proper error boundaries
- Follow existing styling patterns

### Error Handling

- Use GlobalErrorHandler for all errors
- Integrate with Sentry for critical issues
- Provide user-friendly error messages
- Implement retry mechanisms where appropriate

### Performance Considerations

- Lazy load dialog components
- Optimize image handling
- Cache persona detection results
- Implement proper cleanup on unmount

### Accessibility

- Include proper testID attributes
- Implement screen reader support
- Ensure proper touch targets
- Follow platform accessibility guidelines

## Future Enhancements

### Phase 1 (Current)

- Basic profile management
- Time picker integration
- Dialog system setup
- Persona detection

### Phase 2 (Next Steps)

- Full Clerk billing integration
- Push notification implementation
- Advanced activity suggestions
- Data export functionality

### Phase 3 (Future)

- Advanced security features
- Social profile features
- Activity sharing
- Analytics integration

## Related Documentation

- [Styling Specifications](./PROFILE_STYLING_SPECS.md)
- [Implementation Guide](./PROFILE_IMPLEMENTATION_GUIDE.md)
- [Activity Suggestion System](./ACTIVITY_SUGGESTION_SYSTEM.md)
- [Edge Cases Documentation](./PROFILE_EDGE_CASES.md)
