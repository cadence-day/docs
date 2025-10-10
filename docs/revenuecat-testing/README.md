# RevenueCat Testing Documentation

This directory contains comprehensive guides for testing In-App Purchases with RevenueCat before your products are approved in App Store Connect.

## 📚 Documentation Index

### 🚀 Start Here

**[QUICK-ANSWER.md](./QUICK-ANSWER.md)** ⭐️

- 30-second answer to "How do I test without approval?"
- Perfect for immediate solution

**[QUICK-REVENUECAT-SETUP.md](./QUICK-REVENUECAT-SETUP.md)**

- 5-minute setup guide
- Step-by-step instructions with exact commands
- Perfect if you need to test NOW

### 📖 Visual Walkthrough

**[VISUAL-GUIDE.md](./VISUAL-GUIDE.md)**

- Complete visual step-by-step guide
- Diagrams and screenshots descriptions
- Shows exactly what to expect at each step

### � Complete Reference

**[revenuecat-testing-guide.md](./revenuecat-testing-guide.md)**

- Comprehensive testing guide
- All three testing options explained
- Troubleshooting section
- Best practices

### 📊 Decision Guide

**[revenuecat-testing-summary.md](./revenuecat-testing-summary.md)**

- Quick comparison of testing options
- What to use when
- Common issues and solutions
- Resource links

## 🎯 Your Situation: Products Not Approved Yet

You're seeing this error:

```
⚠️ Warning: RevenueCat products not available
```

**This is expected!** Your products aren't approved in App Store Connect yet.

### ✅ Solution: StoreKit Configuration (5 minutes)

1. **Read the quick guide:**

   ```bash
   cat docs/QUICK-REVENUECAT-SETUP.md
   ```

2. **Follow these steps:**
   - Open Xcode workspace
   - Create StoreKit Configuration file
   - Add your products with exact IDs from RevenueCat Dashboard
   - Enable in scheme settings
   - Rebuild with `npx expo run:ios`

3. **Test in the app:**
   - Navigate to: Profile → Debug → Test RevenueCat
   - Verify products load
   - Test purchase flows

## 🧪 Testing Tools

### In-App Debug Screen

**Location:** Profile → Debug → Test RevenueCat

**Features:**

- View CustomerInfo in real-time
- Load and display Offerings
- Test purchase flows
- Monitor entitlements
- Check subscription status
- Live updates via listener

### What You Can Test

✅ **With StoreKit Configuration:**

- Get Customer Info
- Load Offerings with prices
- Complete test purchases (simulated)
- Restore purchases
- Check active entitlements
- Monitor subscription status
- Real-time CustomerInfo updates

✅ **Without Products Approved:**

- Customer Info (basic)
- Active entitlements (if any)
- Subscription status (current state)
- All RevenueCat service methods work
- Only offerings will be empty

## 🔧 Quick Commands

```bash
# Open Xcode workspace
cd ios && open Cadenceday.xcworkspace

# Development build (after StoreKit setup)
npx expo run:ios

# Clean and rebuild
npx expo prebuild --clean -p ios && npx expo run:ios

# View RevenueCat Dashboard
open https://app.revenuecat.com
```

## 📋 Testing Checklist

Before you can test purchases:

- [ ] Products created in RevenueCat Dashboard
- [ ] Product IDs configured
- [ ] Entitlements mapped to products
- [ ] StoreKit Configuration file created (for local testing)
- [ ] Products added to StoreKit file with correct IDs
- [ ] StoreKit file enabled in Xcode scheme
- [ ] Development build installed (not Expo Go)

After setup verification:

- [ ] Test-revenuecat screen shows "Products Available: ✅ Yes"
- [ ] Offerings display all products with prices
- [ ] Can complete test purchases
- [ ] Entitlements update after purchase
- [ ] Restore purchases works
- [ ] CustomerInfo listener receives updates

## 🐛 Troubleshooting

### Products not loading?

1. **Check:** Is StoreKit Configuration file created?
2. **Check:** Is it selected in Edit Scheme → Options?
3. **Check:** Are Product IDs exact matches with RevenueCat?
4. **Fix:** Clean build and rebuild

### Purchase not granting entitlements?

1. **Check:** RevenueCat Dashboard → Entitlements mapping
2. **Check:** Product ID matches exactly
3. **Check:** Entitlement identifier matches your code
4. **Fix:** Update entitlements configuration in RevenueCat

### Still seeing warnings?

- This is expected if products aren't in StoreKit Configuration or App Store Connect
- The service still works for customer info and current state
- You just can't test NEW purchases until configured

## 🔗 External Resources

- **RevenueCat Dashboard:** https://app.revenuecat.com
- **RevenueCat Docs:** https://www.revenuecat.com/docs
- **Testing Guide:** https://www.revenuecat.com/docs/test-and-launch/testing
- **Apple StoreKit:** https://developer.apple.com/documentation/storekit
- **StoreKit Testing:** https://developer.apple.com/documentation/xcode/setting-up-storekit-testing-in-xcode

## 💡 Pro Tips

1. **Start with StoreKit Configuration**
   - Test immediately without waiting for Apple
   - Iterate quickly on your purchase flow
   - Catch bugs early

2. **Test all scenarios**
   - Successful purchases
   - Cancelled purchases
   - Restore purchases
   - Subscription renewals
   - Refunds

3. **Use the debug screen**
   - Monitor CustomerInfo updates in real-time
   - Verify entitlements are granted correctly
   - Check subscription status changes

4. **Before production**
   - Test with Sandbox accounts
   - Verify App Store Connect integration
   - Validate product configurations

## 📱 Where to Go Next

1. **If products aren't approved:**
   → Read `QUICK-REVENUECAT-SETUP.md`

2. **If you want full context:**
   → Read `revenuecat-testing-guide.md`

3. **If you need to decide between options:**
   → Read `revenuecat-testing-summary.md`

4. **If everything is working:**
   → Use the test-revenuecat screen to validate all flows

---

**Questions?** Check the troubleshooting sections in the guides above, or review the [RevenueCat documentation](https://www.revenuecat.com/docs).

**Ready to test?** Open the app and go to: **Profile → Debug → Test RevenueCat** 🚀
