# Purchases Implementation Guide

## Architecture Overview

This guide covers the technical implementation details of the RevenueCat integration for in-app purchases and subscriptions.

## Core Components

### 1. RevenueCatService (`features/purchases/services/RevenueCatService.ts`)

**Purpose**: Centralized service for all RevenueCat operations

**Key Features**:
- Singleton pattern ensures consistent state
- Automatic SDK configuration on app launch
- User login/logout handling
- Purchase processing and validation
- Subscription status synchronization

**API Methods**:
```typescript
// Configuration
await revenueCatService.configure()
await revenueCatService.login(userId)
await revenueCatService.logout()

// Purchase Operations
const offerings = await revenueCatService.getOfferings()
const customerInfo = await revenueCatService.purchasePackage(package)
const restoredInfo = await revenueCatService.restorePurchases()

// Status Checking
const plan = await revenueCatService.checkSubscriptionStatus()
const customerInfo = await revenueCatService.getCustomerInfo()

// Real-time Updates
const unsubscribe = revenueCatService.addCustomerInfoUpdateListener(callback)
```

### 2. useSubscription Hook (`features/purchases/hooks/useSubscription.ts`)

**Purpose**: React hook for subscription state management

**State Management**:
```typescript
const {
  subscriptionPlan,      // "free" | "deep_cadence"
  isLoading,            // Loading state
  customerInfo,         // RevenueCat customer data
  checkSubscription,    // Manual refresh function
  restorePurchases     // Restore purchases function
} = useSubscription()
```

**Integration**:
- Connects to `useProfileStore` for persistence
- Handles real-time subscription updates
- Manages loading and error states
- Provides convenience methods for UI

### 3. SubscriptionPlansDialog (`features/purchases/components/SubscriptionPlansDialog.tsx`)

**Purpose**: Main UI for subscription management

**Features**:
- Plan selection (monthly/yearly)
- Feature comparison
- Purchase flow handling
- Restore purchases option
- Loading states and error handling
- Responsive design with dark mode

**Dialog Integration**:
```typescript
// Registered in shared/dialogs/registry.tsx
"subscription-plans": SubscriptionPlansDialog

// Opened from ProfileScreen
openDialog({
  type: "subscription-plans",
  position: "dock",
  viewSpecific: "profile"
})
```

## Data Flow

### 1. App Initialization
```
User Login → RevenueCat.configure() → RevenueCat.login(userId)
          ↓
Customer Info Retrieved → Subscription Status Checked → Profile Store Updated
```

### 2. Purchase Flow
```
User Opens Dialog → Loads Offerings → Selects Package → Initiates Purchase
                 ↓
RevenueCat Processes → Customer Info Updated → Backend Sync → UI Update
```

### 3. Real-time Updates
```
RevenueCat Listener → Customer Info Change → Subscription Status Check → Profile Update
```

## Backend Integration

### Database Schema
```sql
-- profiles table update
ALTER TABLE profiles ADD COLUMN subscription_plan TEXT DEFAULT 'FREE';
-- Values: 'FREE', 'PREMIUM'
```

### Synchronization Logic
```typescript
// In RevenueCatService.syncSubscriptionStatus()
const isActive = customerInfo.entitlements.active["premium"] !== undefined
const plan = isActive ? "deep_cadence" : "free"

await supabaseClient
  .from("profiles")
  .update({
    subscription_plan: plan === "deep_cadence" ? "PREMIUM" : "FREE",
    updated_at: new Date().toISOString(),
  })
  .eq("id", userId)
```

## Configuration Setup

### 1. Environment Variables
```env
# .env.local or Doppler
EXPO_PUBLIC_REVENUECAT_IOS_API_KEY=appl_xxxxxxxxxxxxx
EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY=goog_xxxxxxxxxxxxx
```

### 2. Product Configuration (`features/purchases/constants/products.ts`)
```typescript
export const PRODUCT_IDS = {
  MONTHLY_PREMIUM: "cadence_premium_monthly",
  YEARLY_PREMIUM: "cadence_premium_yearly",
} as const

export const ENTITLEMENT_IDS = {
  PREMIUM: "premium",
} as const
```

### 3. Feature Gates
```typescript
// Example usage throughout app
const { subscriptionPlan } = useSubscription()
const isPremium = subscriptionPlan === "deep_cadence"

// Conditional rendering
{isPremium && <PremiumFeature />}

// Feature limits
const maxHabits = isPremium ? -1 : 5
```

## Error Handling

### Purchase Errors
```typescript
try {
  const customerInfo = await revenueCatService.purchasePackage(package)
} catch (error) {
  const purchasesError = error as PurchasesError
  if (!purchasesError.userCancelled) {
    // Handle actual errors (network, payment, etc.)
    GlobalErrorHandler.logError(error, "Purchase failed")
  }
  // User cancellation is handled gracefully
}
```

### Network Resilience
- Offline state handling
- Retry mechanisms for failed syncs
- Cached subscription status
- Graceful degradation

### User Experience
- Clear error messages
- Retry options
- Support contact information
- Alternative payment methods

## Testing Implementation

### Development Testing
```typescript
// Enable debug logging in development
if (__DEV__) {
  Purchases.setLogLevel(LOG_LEVEL.DEBUG)
}

// Test with sandbox environment
// RevenueCat automatically uses sandbox for debug builds
```

### Mock Testing
```typescript
// For unit tests, mock the RevenueCat service
jest.mock("@/features/purchases/services/RevenueCatService", () => ({
  revenueCatService: {
    configure: jest.fn(),
    purchasePackage: jest.fn(),
    // ... other methods
  }
}))
```

## Performance Considerations

### Initialization
- RevenueCat configured once on app launch
- Lazy loading of purchase dialogs
- Cached customer info
- Minimal SDK calls

### Memory Management
- Singleton service pattern
- Proper listener cleanup
- No memory leaks from subscriptions
- Efficient React hook usage

### Network Optimization
- Batch subscription status checks
- Efficient sync operations
- Offline capability
- Smart retry logic

## Security Implementation

### API Key Security
```typescript
// API keys stored in environment variables
// Platform-specific keys for iOS/Android
// No hardcoded credentials in code

const apiKey = Platform.OS === "ios"
  ? SECRETS.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY
  : SECRETS.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY
```

### User Authentication
```typescript
// RevenueCat user ID matches Clerk user ID
const userId = user?.id
await revenueCatService.login(userId)

// Backend verification
await supabaseClient
  .from("profiles")
  .update({ subscription_plan: plan })
  .eq("id", userId) // Ensures user can only update their own record
```

### Payment Security
- All payments processed by Apple/Google
- No credit card data in app
- PCI compliance through vendors
- Secure receipt validation

## Monitoring & Analytics

### Subscription Metrics
```typescript
// Track key events
analytics.track("subscription_viewed", {
  user_id: userId,
  current_plan: subscriptionPlan
})

analytics.track("purchase_completed", {
  user_id: userId,
  product_id: package.identifier,
  price: package.product.price
})
```

### Error Monitoring
```typescript
// Sentry integration
GlobalErrorHandler.logError(error, "Purchase failed", {
  user_id: userId,
  product_id: package?.identifier,
  error_code: error.code
})
```

## Migration & Updates

### Schema Migrations
- Database updates for subscription fields
- Profile store schema updates
- Backward compatibility considerations

### Feature Rollout
- Progressive feature enablement
- A/B testing capabilities
- Rollback procedures
- User communication strategy

## Troubleshooting

### Common Issues
1. **RevenueCat not configured**: Check API keys in environment
2. **Purchase failures**: Verify product IDs match store setup
3. **Sync issues**: Check network connectivity and Supabase auth
4. **Missing entitlements**: Verify RevenueCat dashboard configuration

### Debug Tools
```typescript
// Enable verbose logging
Purchases.setLogLevel(LOG_LEVEL.VERBOSE)

// Check customer info
const info = await Purchases.getCustomerInfo()
console.log("Customer Info:", info)

// Verify offerings
const offerings = await Purchases.getOfferings()
console.log("Available Offerings:", offerings)
```

### Support Resources
- RevenueCat dashboard analytics
- Sentry error tracking
- User feedback integration
- Store review monitoring