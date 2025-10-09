# Quick Setup: Testing RevenueCat Before App Store Approval

## The 5-Minute Solution

Your products aren't approved yet, but you can still test everything locally with a StoreKit Configuration file.

### Step-by-Step Instructions

#### 1. Open Xcode
```bash
cd ios
open Cadenceday.xcworkspace
```

#### 2. Create StoreKit Configuration File

In Xcode:
1. **File** → **New** → **File...** (⌘N)
2. Search for "**StoreKit**"
3. Select "**StoreKit Configuration File**"
4. Name it: `**Products.storekit**`
5. Save location: `ios/` directory
6. Click **Create**

#### 3. Add Your Products

In the StoreKit editor that opens:

1. Click the **"+"** button at the bottom
2. Select **"Add Auto-Renewable Subscription"**
3. Fill in your product details:

**Product 1: Supporter**
```
Reference Name: Supporter Monthly
Product ID: supporter_monthly
Price: $2.99
Subscription Duration: 1 Month
Subscription Group ID: cadence_subscriptions
```

**Product 2: Feature Sponsor**
```
Reference Name: Feature Sponsor Monthly  
Product ID: feature_sponsor_monthly
Price: $9.99
Subscription Duration: 1 Month
Subscription Group ID: cadence_subscriptions
```

**Product 3: Premium Supporter**
```
Reference Name: Premium Supporter Monthly
Product ID: premium_supporter_monthly
Price: $29.99
Subscription Duration: 1 Month
Subscription Group ID: cadence_subscriptions
```

> **⚠️ Important:** Product IDs must **exactly match** what's in your RevenueCat Dashboard.

#### 4. Enable StoreKit in Your Scheme

In Xcode:
1. Click your app name in the top toolbar (next to device selector)
2. Select **"Edit Scheme..."**
3. Select **"Run"** in the left sidebar
4. Go to **"Options"** tab
5. Under **"StoreKit Configuration"**, select `Products.storekit`
6. Click **Close**

#### 5. Build and Run

```bash
# From your project root
npx expo run:ios
```

> **Note:** Must be a development build, not Expo Go.

#### 6. Test in the App

1. Open the app
2. Go to **Profile** → **Debug** → **Test RevenueCat**
3. You should now see:
   - ✅ Products Available: Yes
   - ✅ Offerings showing all 3 products
   - ✅ Test Purchase buttons enabled

### Verify It's Working

In the test-revenuecat screen:

- [ ] Status shows "Products Available: ✅ Yes"
- [ ] Offerings section displays all 3 subscription tiers
- [ ] Each package shows correct price ($2.99, $9.99, $29.99)
- [ ] "Test Purchase" buttons are clickable
- [ ] Clicking "Get Offerings" shows success alert

### Testing Purchases

1. Click "Test Purchase" on any package
2. In Xcode, you'll see a purchase dialog (Debug → StoreKit → Transaction Manager)
3. Approve the purchase
4. Check that:
   - [ ] CustomerInfo updates automatically
   - [ ] Active Entitlements shows the new entitlement
   - [ ] Subscription Status changes from "free" to your tier
   - [ ] Live update timestamp changes

### Managing Test Transactions

While the app is running in Xcode:

**View all test transactions:**
- Xcode: **Debug** → **StoreKit** → **Manage Transactions...**

**You can:**
- ✅ Approve/decline subscription renewals
- ✅ Simulate refunds
- ✅ Clear all purchases (to test from scratch)
- ✅ Fast-forward subscription renewals

### Troubleshooting

**"Still showing Products Not Available"**
1. Make sure you selected the StoreKit file in your scheme (Step 4)
2. Clean build: Xcode → **Product** → **Clean Build Folder** (⇧⌘K)
3. Rebuild: `npx expo run:ios`

**"Products load but purchase fails"**
1. Check Xcode debug console for StoreKit errors
2. Verify Product IDs match exactly between:
   - StoreKit Configuration file
   - RevenueCat Dashboard
   - Your entitlements mapping

**"Entitlements not granted after purchase"**
1. Open [RevenueCat Dashboard](https://app.revenuecat.com)
2. Go to **Entitlements**
3. Verify product → entitlement mapping:
   - `supporter_monthly` → `supporter`
   - `feature_sponsor_monthly` → `feature_sponsor`
   - `premium_supporter_monthly` → `premium_supporter`

### Getting Your Product IDs

Don't remember your Product IDs?

1. Open [RevenueCat Dashboard](https://app.revenuecat.com)
2. Select your project
3. Go to **Products** section
4. Copy the exact Product IDs listed
5. Use those in your StoreKit Configuration file

### Complete Testing Checklist

- [ ] StoreKit Configuration file created
- [ ] All 3 products added with correct IDs
- [ ] Subscription group configured
- [ ] Prices set for each tier
- [ ] StoreKit file enabled in scheme
- [ ] Development build installed (not Expo Go)
- [ ] Test-revenuecat screen shows products available
- [ ] Can view offerings with prices
- [ ] Can complete test purchases
- [ ] Entitlements update after purchase
- [ ] Can restore purchases
- [ ] CustomerInfo listener receives updates

### Next Steps

Once you've tested locally:

1. **Submit to App Store Connect** (when ready)
2. **Test with Sandbox** (optional, for additional validation)
3. **Get products approved** by Apple
4. **Test in production** with real/sandbox accounts

---

## Quick Reference Commands

```bash
# Open Xcode
cd ios && open Cadenceday.xcworkspace

# Development build
npx expo run:ios

# Clean and rebuild
npx expo prebuild --clean -p ios && npx expo run:ios

# View pod dependencies
cd ios && pod install && cd ..
```

## Resources

- **Full Guide:** `docs/revenuecat-testing-guide.md`
- **RevenueCat Dashboard:** https://app.revenuecat.com
- **Apple StoreKit Docs:** https://developer.apple.com/documentation/xcode/setting-up-storekit-testing-in-xcode
- **RevenueCat Testing Docs:** https://www.revenuecat.com/docs/test-and-launch/testing

---

**That's it!** You should now be able to test all RevenueCat functionality without waiting for App Store approval. 🎉
