# 📋 RevenueCat Testing - Quick Reference Card

## 🎯 Problem

Products not approved in App Store Connect yet. Can't test In-App Purchases.

## ✅ Solution

Use **StoreKit Configuration** files for local testing.

---

## 🚀 5-Minute Setup

### 1. Open Xcode

```bash
cd ios && open Cadenceday.xcworkspace
```

### 2. Create StoreKit File

- Xcode → **File** → **New** → **File**
- Search: "**StoreKit**"
- Select: "**StoreKit Configuration File**"
- Name: `Products.storekit`
- Save in: `ios/` directory

### 3. Add Products

Click **[+]** and add:

| Product ID                  | Price  | Duration |
| --------------------------- | ------ | -------- |
| `supporter_monthly`         | $2.99  | 1 Month  |
| `feature_sponsor_monthly`   | $9.99  | 1 Month  |
| `premium_supporter_monthly` | $29.99 | 1 Month  |

⚠️ **IDs must match RevenueCat Dashboard exactly!**

### 4. Enable in Scheme

- Click app name → **Edit Scheme**
- **Run** → **Options** tab
- **StoreKit Configuration** → Select `Products.storekit`

### 5. Build & Test

```bash
npx expo run:ios
```

---

## 📱 Testing

### Access Screen

```
Profile → Debug → Test RevenueCat
```

### Verify Success

- ✅ Products Available: **Yes**
- ✅ Offerings: **3 packages shown**
- ✅ Prices: **$2.99, $9.99, $29.99**

### Test Operations

- Get Customer Info
- Get Offerings
- Test Purchase
- Restore Purchases
- Check Entitlements

---

## 🔍 Quick Checks

### ❌ Not Working?

1. Clean build (Xcode → Product → Clean)
2. Verify StoreKit file in scheme
3. Check Product IDs match
4. Rebuild

### ✅ Working?

- Products Available shows ✅
- Offerings display all packages
- Purchases complete successfully
- Entitlements update

---

## 📚 Documentation

| File                            | Purpose            |
| ------------------------------- | ------------------ |
| `QUICK-ANSWER.md`               | 30-sec answer      |
| `QUICK-REVENUECAT-SETUP.md`     | Step-by-step       |
| `VISUAL-GUIDE.md`               | Visual walkthrough |
| `revenuecat-testing-guide.md`   | Complete guide     |
| `revenuecat-testing-summary.md` | Options comparison |

**Location:** `docs/revenuecat-testing/`

---

## 🎮 Xcode Transaction Manager

### Access

```
Debug → StoreKit → Manage Transactions
```

### Features

- View all test purchases
- Approve/decline renewals
- Simulate refunds
- Clear all transactions

---

## ⚡️ Quick Commands

```bash
# Open Xcode
cd ios && open Cadenceday.xcworkspace

# Build
npx expo run:ios

# Clean rebuild
npx expo prebuild --clean -p ios && npx expo run:ios

# View docs
cat docs/revenuecat-testing/QUICK-ANSWER.md
```

---

## 🔗 Important Links

- **RevenueCat Dashboard:** https://app.revenuecat.com
- **StoreKit Docs:** https://developer.apple.com/storekit
- **RevenueCat Testing:** https://rev.cat/testing

---

## ✅ Testing Checklist

**Setup:**

- [ ] StoreKit file created
- [ ] 3 products added
- [ ] IDs match RevenueCat
- [ ] File enabled in scheme
- [ ] App rebuilt

**Verification:**

- [ ] Products Available: ✅
- [ ] Offerings display
- [ ] Purchases work
- [ ] Entitlements update

---

**Bottom Line:** Test everything NOW. No App Store approval needed! 🚀

---

_Keep this card handy for quick reference during testing!_
