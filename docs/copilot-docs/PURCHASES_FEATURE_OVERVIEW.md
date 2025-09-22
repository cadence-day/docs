# Purchases Feature Overview

## Overview

The Purchases feature integrates RevenueCat SDK to handle in-app purchases and subscription management for Cadence. This enables users to upgrade from the free tier to Deep Cadence Premium with access to advanced features.

## Feature Structure

```
features/purchases/
├── components/
│   └── SubscriptionPlansDialog.tsx    # Main subscription plans UI
├── constants/
│   └── products.ts                    # Product IDs and feature definitions
├── hooks/
│   └── useSubscription.ts             # Subscription state management
└── services/
    └── RevenueCatService.ts           # Core RevenueCat integration
```

## Subscription Tiers

### Free Tier

- Basic daily reminders
- 5 habit tracking limit
- Basic statistics
- Community support
- 3 reminder limit

### Deep Cadence Premium

- Unlimited habit tracking
- Advanced analytics & insights
- Custom reminder schedules
- Priority support
- Export data to CSV
- Theme customization
- Backup & sync across devices
- No ads

## Product Configuration

### Product IDs

- `cadence_premium_monthly` - Monthly subscription
- `cadence_premium_yearly` - Yearly subscription (with savings)

### Entitlements

- `premium` - Unlocks all premium features

## Integration Points

### User Interface

- **Profile Screen**: Main entry point via "Subscription Plan" button
- **Subscription Dialog**: Full-screen modal with plan selection
- **Feature Gates**: Throughout app based on subscription status

### Backend Sync

- RevenueCat manages subscription status directly
- Real-time subscription status updates via RevenueCat SDK
- Customer info persistence handled by RevenueCat

### State Management

- Zustand store integration via `useProfileStore`
- Real-time subscription state via `useSubscription` hook
- Local subscription plan tracking

## Key Features

### Purchase Flow

1. User taps "Subscription Plan" in Profile
2. Subscription dialog opens with plan options
3. User selects monthly/yearly billing
4. RevenueCat handles secure payment
5. Subscription status syncs to backend
6. UI updates reflect new premium status

### Restore Purchases

- One-tap restore for existing subscribers
- Handles account transfers between devices
- Syncs restored status with backend

### Error Handling

- Graceful handling of purchase cancellations
- Network error resilience
- User-friendly error messages
- Comprehensive logging via GlobalErrorHandler

## Technical Implementation

### RevenueCat Service

- Singleton pattern for consistent state
- Automatic configuration on user login
- Customer info caching and sync
- Purchase package handling

### Subscription Hook

- React hook for subscription state
- Loading states and error handling
- Profile store integration
- Real-time updates via listeners

### Dialog System

- Follows app's dialog registry pattern
- Proper lifecycle management
- Responsive design with dark mode support
- Accessibility considerations

## Environment Setup

### Required Environment Variables

```env
EXPO_PUBLIC_REVENUECAT_IOS_API_KEY=your_ios_api_key
EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY=your_android_api_key
```

### App Configuration

- No additional Expo plugins required
- Works with existing Expo managed workflow
- Compatible with EAS Build and Updates

## Testing Strategy

### Development Testing

- RevenueCat Sandbox environment
- Test user accounts
- Mock purchase flows
- Error scenario testing

### Production Validation

- Real payment processing
- Subscription lifecycle testing
- Cross-platform verification
- Analytics and metrics tracking

## Security Considerations

### Payment Security

- All payments processed by RevenueCat/Apple/Google
- No credit card data handled by app
- Secure token-based authentication
- PCI compliance through vendors

### API Security

- RevenueCat API keys stored securely
- User ID validation
- Backend subscription verification
- Webhook signature verification (future)

## Analytics & Monitoring

### Key Metrics

- Subscription conversion rates
- Churn analysis
- Revenue tracking
- Feature usage by tier

### Error Monitoring

- Sentry integration for purchase errors
- RevenueCat dashboard analytics
- Custom error tracking
- Performance monitoring

## Future Enhancements

### Planned Features

- Family sharing support
- Promotional codes/discounts
- Trial period extensions
- Corporate/team subscriptions
- Webhook integration for real-time sync

### Optimization Areas

- Purchase flow A/B testing
- Pricing strategy optimization
- Feature usage analytics
- Customer retention improvements

## Support & Documentation

### User Support

- In-app purchase troubleshooting
- Subscription management guides
- Billing inquiry handling
- Feature access support

### Developer Resources

- RevenueCat documentation integration
- Testing guidelines
- Deployment checklists
- Store approval processes
