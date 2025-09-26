# Purchases Feature

## Overview

The Purchases feature handles community subscriptions and feature sponsorship for Cadence using RevenueCat. It provides a transparent, community-driven subscription model with four tiers: Free Explorer, Supporter, Premium Supporter, and Feature Sponsor.

## Architecture

This feature follows the standard feature architecture pattern with the following structure:

```
features/purchases/
├── constants/
│   └── products.ts           # Product IDs, entitlements, and feature definitions
├── dialogs/
│   ├── SubscriptionPlansDialog.tsx  # Main subscription plans UI
│   └── index.ts              # Dialog exports
├── hooks/
│   └── useSubscription.ts    # Subscription state management hook
├── services/
│   └── RevenueCatService.ts  # Core RevenueCat integration service
├── index.ts                  # Public API exports
├── types.ts                  # Feature-specific TypeScript types
└── README.md                 # This file
```

## Key Components

### RevenueCatService (`services/RevenueCatService.ts`)

Singleton service that handles all RevenueCat operations:
- SDK configuration and initialization
- User login/logout management
- Purchase processing and validation
- Subscription status synchronization with Supabase
- Real-time customer info updates

### useSubscription Hook (`hooks/useSubscription.ts`)

React hook for subscription state management:
- Provides current subscription status
- Handles loading states and errors
- Manages real-time subscription updates
- Integrates with profile store for persistence

### SubscriptionPlansDialog (`dialogs/SubscriptionPlansDialog.tsx`)

Main UI component for subscription management:
- Displays available subscription plans
- Handles purchase flow
- Shows feature comparisons
- Manages restore purchases functionality

## Public API

The feature exports the following public interface via `index.ts`:

### Hooks
- `useSubscription()` - Main subscription state hook

### Services
- `revenueCatService` - Core RevenueCat service instance

### Types
- `SubscriptionPlan` - Plan type ("free" | "deep_cadence")
- `UseSubscriptionReturn` - Hook return type
- `Product` - Product information interface
- `CustomerInfo` - RevenueCat customer data type

### Constants
- `SUBSCRIPTION_FEATURES` - Feature definitions for each plan

## Usage

### Basic Subscription Check
```typescript
import { useSubscription } from "@/features/purchases";

function MyComponent() {
  const { subscriptionPlan, isLoading } = useSubscription();

  const isSupporter = subscriptionPlan !== "free";
  const hasPremiumFeatures = ["premium_supporter", "feature_sponsor"].includes(subscriptionPlan);

  return (
    <View>
      {hasPremiumFeatures ? <PremiumFeature /> : <FreeFeature />}
      {isSupporter && <SupporterBadge />}
    </View>
  );
}
```

### Opening Subscription Dialog
```typescript
import { useDialogStore } from "@/shared/stores";

function ProfileComponent() {
  const openDialog = useDialogStore((s) => s.openDialog);

  const handleSubscriptionPress = () => {
    openDialog({
      type: "subscription-plans",
      position: "dock",
      viewSpecific: "profile",
    });
  };

  return (
    <Button onPress={handleSubscriptionPress}>
      Manage Subscription
    </Button>
  );
}
```

### Feature Gating
```typescript
import { SUBSCRIPTION_TIERS } from "@/features/purchases";

function FeatureComponent() {
  const { subscriptionPlan } = useSubscription();
  const tierLimits = SUBSCRIPTION_TIERS[subscriptionPlan].limits;

  const canExportData = tierLimits.exportData;
  const hasBetaAccess = tierLimits.betaAccess;
  const hasAIInsights = tierLimits.aiInsights;

  return (
    <View>
      {canExportData && <ExportButton />}
      {hasBetaAccess && <BetaFeatures />}
      {hasAIInsights && <SageAIInsights />}
    </View>
  );
}
```

## Configuration

### Required Environment Variables
```env
EXPO_PUBLIC_REVENUECAT_IOS_API_KEY=appl_xxxxxxxxxxxxx
EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY=goog_xxxxxxxxxxxxx
```

### Product Configuration
Products are defined in `constants/products.ts`:
- `cadence_supporter_monthly` - Monthly supporter subscription
- `cadence_supporter_yearly` - Yearly supporter subscription
- `cadence_premium_supporter_monthly` - Premium supporter subscription
- `cadence_feature_sponsor_onetime` - One-time feature sponsor purchase

Entitlement IDs:
- `supporter` - Basic supporter features
- `premium_supporter` - Premium supporter features
- `feature_sponsor` - Feature sponsor privileges

## Integration Points

### Dialog System
The subscription dialog is registered in the global dialog registry and can be opened using the dialog store.

### Profile Store
Subscription status is synchronized with the user's profile store and persisted to Supabase.

### Authentication
RevenueCat is automatically configured when users sign in and cleaned up on sign out.

## Testing

### Development Testing
- Uses RevenueCat sandbox environment automatically in debug builds
- Supports iOS sandbox Apple IDs and Android license testing
- Debug logging enabled in development mode

### Mock Testing
```typescript
// Mock the service for unit tests
jest.mock("@/features/purchases", () => ({
  useSubscription: () => ({
    subscriptionPlan: "free",
    isLoading: false,
    customerInfo: null,
    checkSubscription: jest.fn(),
    restorePurchases: jest.fn(),
  }),
}));
```

## Error Handling

The feature includes comprehensive error handling:
- Purchase cancellations are handled gracefully
- Network errors are retried automatically
- User-friendly error messages via GlobalErrorHandler
- Fallback to free tier on any errors

## Security

- All payments processed by Apple/Google/RevenueCat
- No credit card data handled by the app
- API keys stored securely in environment variables
- User validation through Supabase integration

## Future Enhancements

Planned improvements:
- Family sharing support
- Promotional codes and discounts
- Corporate/team subscriptions
- Enhanced analytics and A/B testing
- Webhook integration for real-time sync

## See Also

- [Store Setup Guide](../../docs/STORE_SETUP_GUIDE.md) - App Store and Play Store configuration
- [RevenueCat Setup Guide](../../docs/REVENUECAT_SETUP_GUIDE.md) - RevenueCat dashboard setup
- [Purchases Feature Overview](../../docs/PURCHASES_FEATURE_OVERVIEW.md) - High-level feature documentation
- [Purchases Implementation Guide](../../docs/PURCHASES_IMPLEMENTATION_GUIDE.md) - Technical implementation details