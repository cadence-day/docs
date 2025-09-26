// Features/purchases public API
// Only export what other features need to use

// Hooks
export { useSubscription } from "./hooks/useSubscription";

// Services (for external integration only)
export { revenueCatService } from "./services/RevenueCatService";

// Types (public interfaces only)
export type {
  SubscriptionPlan,
  UseSubscriptionReturn,
  Product,
  CustomerInfo
} from "./types";

// Constants (public constants only)
export { SUBSCRIPTION_TIERS } from "./constants/products";

// Note: Components are not exported as they're used internally via dialog registry
// Note: Service internals are not exported to maintain encapsulation