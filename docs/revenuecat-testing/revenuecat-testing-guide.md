# RevenueCat Testing Guide - Testing Without App Store Approval

## Problem

You're seeing this error because your In-App Purchase products aren't approved yet in App Store Connect:

```
Error: There's a problem with your configuration. None of the products registered 
in the RevenueCat dashboard could be fetched from App Store Connect.
```

This is **expected** and **normal** during development. Here are your options for testing:

---

## Option 1: StoreKit Configuration File (Recommended for Local Testing)

Apple provides StoreKit Configuration files that let you test IAPs completely locally without any App Store Connect setup.

### Step 1: Create StoreKit Configuration File in Xcode

1. **Open your project in Xcode:**
   ```bash
   cd ios
   open Cadenceday.xcworkspace
   ```

2. **Create the configuration file:**
   - In Xcode, go to: **File → New → File...**
   - Search for "StoreKit"
   - Select **"StoreKit Configuration File"**
   - Name it: `Products.storekit`
   - Save it in the `ios/` directory

3. **Add your products to the file:**
   
   In the StoreKit Configuration file editor, click the **"+"** button and add your products:

   **Example for your Cadence.day tiers:**
   
   ```
   Product 1:
   - Type: Auto-Renewable Subscription
   - Reference Name: Supporter Monthly
   - Product ID: supporter_monthly (must match RevenueCat dashboard)
   - Price: $2.99
   - Subscription Group: cadence_subscriptions
   - Subscription Duration: 1 Month
   
   Product 2:
   - Type: Auto-Renewable Subscription
   - Reference Name: Feature Sponsor Monthly
   - Product ID: feature_sponsor_monthly
   - Price: $9.99
   - Subscription Group: cadence_subscriptions
   - Subscription Duration: 1 Month
   
   Product 3:
   - Type: Auto-Renewable Subscription
   - Reference Name: Premium Supporter Monthly
   - Product ID: premium_supporter_monthly
   - Price: $29.99
   - Subscription Group: cadence_subscriptions
   - Subscription Duration: 1 Month
   ```

   **Important:** The `Product ID` must **exactly match** what you configured in the RevenueCat dashboard.

### Step 2: Enable StoreKit Testing in Xcode

1. **In Xcode, select your scheme:**
   - Top toolbar: Click on your app name next to the device selector
   - Select **"Edit Scheme..."**

2. **Configure StoreKit:**
   - Select **"Run"** in the left sidebar
   - Go to the **"Options"** tab
   - Under **"StoreKit Configuration"**, select your `Products.storekit` file

3. **Build and run** from Xcode:
   ```bash
   npx expo run:ios
   ```

### Step 3: Test Purchases

Now when you use the test-revenuecat screen, you should see:
- ✅ Offerings loaded successfully
- ✅ Product prices displayed
- ✅ Test purchases work (they're simulated, not real charges)
- ✅ All RevenueCat functionality testable

### Step 4: Manage Test Transactions in Xcode

While your app is running:
- In Xcode: **Debug → StoreKit → Manage Transactions...**
- You can see all test purchases
- You can approve/decline subscription renewals
- You can simulate refunds

---

## Option 2: Sandbox Testing (Requires App Store Connect Setup)

If your products are submitted to App Store Connect but not yet approved, you can use Sandbox testing.

### Requirements:
1. Products must be created in App Store Connect (doesn't need to be approved)
2. Create a Sandbox test account in App Store Connect
3. Sign in with the sandbox account on your test device

### Steps:

1. **Create Sandbox Tester:**
   - Go to [App Store Connect](https://appstoreconnect.apple.com)
   - Navigate to: **Users and Access → Sandbox Testers**
   - Click **"+"** to add a new tester
   - Use a **unique email** (can be fake like `test@example.com`)

2. **Sign out of your Apple ID on the test device:**
   - Settings → App Store → Sign Out

3. **Run your app and make a test purchase:**
   - When prompted, sign in with your sandbox account
   - Purchases will be simulated (no real charges)

4. **Test in your app:**
   - Navigate to the RevenueCat test screen
   - Offerings should now load successfully
   - Test all purchase flows

---

## Option 3: Wait for App Store Approval

If you don't need to test immediately, you can:

1. Complete your app submission to App Store Connect
2. Submit IAP products for review
3. Once approved, test in production with real (or sandbox) transactions

**Timeline:** Usually 24-48 hours for IAP review.

---

## Recommended Approach

**For Development (Now):**
- ✅ Use **StoreKit Configuration File** (Option 1)
- Fast, local, no external dependencies
- Full testing of all IAP logic
- No waiting for Apple approvals

**For Pre-Production Testing:**
- ✅ Use **Sandbox Testing** (Option 2)
- Tests the full flow with App Store Connect
- Validates your product configuration
- Catches any backend issues before production

**For Production:**
- ✅ Use approved products
- Monitor with RevenueCat dashboard
- Use the test-revenuecat screen to debug live issues

---

## Troubleshooting

### "Product IDs don't match"

Make sure the Product ID in your StoreKit file **exactly matches** your RevenueCat dashboard:

1. Open [RevenueCat Dashboard](https://app.revenuecat.com)
2. Go to: **Products → [Your Project]**
3. Copy the exact Product IDs
4. Paste them into your StoreKit Configuration file

### "Still seeing errors with StoreKit file"

1. Clean build folder: In Xcode, **Product → Clean Build Folder** (⇧⌘K)
2. Make sure the StoreKit file is selected in your scheme
3. Rebuild: `npx expo run:ios`
4. Make sure you're not running through Expo Go (must be a development build)

### "Purchases complete but entitlements not granted"

Check your RevenueCat entitlements mapping:
1. RevenueCat Dashboard → **Entitlements**
2. Make sure each product is mapped to the correct entitlement:
   - `supporter_monthly` → `supporter`
   - `feature_sponsor_monthly` → `feature_sponsor`
   - `premium_supporter_monthly` → `premium_supporter`

---

## Testing Checklist

Use this checklist with your test-revenuecat screen:

- [ ] Get Customer Info returns valid data
- [ ] Get Offerings shows all products with correct prices
- [ ] Get Active Entitlements shows current subscriptions
- [ ] Check Subscription Status returns correct tier
- [ ] Test Purchase flow completes successfully
- [ ] After purchase, entitlements update automatically
- [ ] Restore Purchases works correctly
- [ ] CustomerInfo listener receives real-time updates
- [ ] Subscription status reflects in your app UI

---

## Additional Resources

- [RevenueCat Testing Guide](https://www.revenuecat.com/docs/test-and-launch/testing)
- [Apple StoreKit Testing](https://developer.apple.com/documentation/xcode/setting-up-storekit-testing-in-xcode)
- [RevenueCat Dashboard](https://app.revenuecat.com)
- [App Store Connect](https://appstoreconnect.apple.com)

---

## Quick Commands

```bash
# Open Xcode workspace
cd ios && open Cadenceday.xcworkspace

# Run development build
npx expo run:ios

# Clean and rebuild
cd ios && pod install && cd .. && npx expo run:ios

# View RevenueCat logs
# In test-revenuecat screen, all operations log to console
```
