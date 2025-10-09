# 📱 RevenueCat Testing - Visual Step-by-Step Guide

## 🎯 Goal

Test In-App Purchases **before** App Store approval using StoreKit Configuration.

---

## 📋 Prerequisites

✅ Xcode installed  
✅ RevenueCat products configured in dashboard  
✅ Development build capability (not Expo Go)  
✅ Product IDs from RevenueCat Dashboard

---

## 🔧 Setup Process

### Step 1: Open Xcode Workspace

```
┌─────────────────────────────────────┐
│ Terminal                            │
├─────────────────────────────────────┤
│ $ cd ios                            │
│ $ open Cadenceday.xcworkspace       │
└─────────────────────────────────────┘
```

### Step 2: Create StoreKit Configuration File

```
Xcode Menu Bar
├── File
│   └── New
│       └── File... (⌘N)
│           └── Search: "StoreKit"
│               └── Select: "StoreKit Configuration File"
│                   └── Name: Products.storekit
│                       └── Save in: ios/
│                           └── Click: Create
```

### Step 3: Add Products to StoreKit File

```
┌─────────────────────────────────────────────┐
│ Products.storekit                           │
├─────────────────────────────────────────────┤
│ [+] Add Subscription ▼                      │
│                                             │
│ ┌─────────────────────────────────────┐   │
│ │ Product 1: supporter_monthly        │   │
│ │ Price: $2.99                        │   │
│ │ Duration: 1 Month                   │   │
│ │ Group: cadence_subscriptions        │   │
│ └─────────────────────────────────────┘   │
│                                             │
│ ┌─────────────────────────────────────┐   │
│ │ Product 2: feature_sponsor_monthly  │   │
│ │ Price: $9.99                        │   │
│ │ Duration: 1 Month                   │   │
│ │ Group: cadence_subscriptions        │   │
│ └─────────────────────────────────────┘   │
│                                             │
│ ┌─────────────────────────────────────┐   │
│ │ Product 3: premium_supporter_monthly│   │
│ │ Price: $29.99                       │   │
│ │ Duration: 1 Month                   │   │
│ │ Group: cadence_subscriptions        │   │
│ └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

**⚠️ Critical:** Product IDs must match RevenueCat Dashboard exactly!

### Step 4: Enable StoreKit in Scheme

```
Xcode Top Bar
├── [Cadenceday] ▼ (next to device selector)
│   └── Edit Scheme...
│       └── Left Sidebar: Run
│           └── Tab: Options
│               └── StoreKit Configuration: [Products.storekit ▼]
│                   └── Click: Close
```

### Step 5: Build and Run

```
┌─────────────────────────────────────┐
│ Terminal                            │
├─────────────────────────────────────┤
│ $ npx expo run:ios                  │
│                                     │
│ Building development build...       │
│ Installing on simulator...          │
│ ✅ App launched successfully        │
└─────────────────────────────────────┘
```

---

## 📱 Testing in App

### Navigate to Test Screen

```
App Navigation
├── Profile Tab
│   └── Debug Section
│       └── "Test RevenueCat" Button
│           └── Test Screen Opens
```

### Verify Setup Success

```
┌─────────────────────────────────────────────┐
│ RevenueCat Testing                    [🔄]  │
├─────────────────────────────────────────────┤
│ 📊 Status                                   │
│ Subscription Plan: FREE                     │
│ Products Available: ✅ Yes                  │
│ Last Update: 10:30:45                       │
├─────────────────────────────────────────────┤
│ 🛒 Offerings (3)                            │
│                                             │
│ ┌─────────────────────────────────────┐   │
│ │ supporter_monthly                   │   │
│ │ $2.99                               │   │
│ │ [Test Purchase]                     │   │
│ └─────────────────────────────────────┘   │
│                                             │
│ ┌─────────────────────────────────────┐   │
│ │ feature_sponsor_monthly             │   │
│ │ $9.99                               │   │
│ │ [Test Purchase]                     │   │
│ └─────────────────────────────────────┘   │
│                                             │
│ ┌─────────────────────────────────────┐   │
│ │ premium_supporter_monthly           │   │
│ │ $29.99                              │   │
│ │ [Test Purchase]                     │   │
│ └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

### Test Purchase Flow

```
1. Tap "Test Purchase" on any package
   ↓
2. StoreKit dialog appears (Xcode Debug Console)
   ↓
3. In Xcode: Debug → StoreKit → Manage Transactions
   ↓
4. Approve the transaction
   ↓
5. App receives CustomerInfo update
   ↓
6. Entitlements section updates
   ↓
7. Subscription Status changes to tier
```

---

## 🔍 What Each Screen Shows

### Before Purchase

```
📊 Status
├── Plan: FREE
├── Products: ✅ Yes
└── Entitlements: 0

👤 Customer Info
├── User ID: user_abc123
├── Request Date: [timestamp]
└── Active Entitlements: 0

🎫 Active Entitlements
└── No active entitlements
```

### After Purchase (e.g., Supporter)

```
📊 Status
├── Plan: SUPPORTER ← Changed!
├── Products: ✅ Yes
└── Entitlements: 1 ← Changed!

👤 Customer Info
├── User ID: user_abc123
├── Request Date: [timestamp]
└── Active Entitlements: 1 ← Changed!

🎫 Active Entitlements
└── • supporter ← New!
```

---

## 🧪 Test Operations Available

```
🔍 Query Operations
├── [Get Customer Info]      → Fetch current state
├── [Get Offerings]          → Load products
├── [Get Active Entitlements]→ List subscriptions
├── [Check Subscription Status] → Get current tier
└── [Check Products Available] → Verify setup

💳 Purchase Operations
├── [Test Purchase]          → Simulate purchase
└── [Restore Purchases]      → Test restoration

🔄 Live Updates
└── Automatic CustomerInfo streaming
    (Updates shown in real-time)
```

---

## 🎮 Managing Test Transactions (Xcode)

### View Transactions

```
Xcode Menu
└── Debug
    └── StoreKit
        └── Manage Transactions...
            ├── View all test purchases
            ├── Approve/decline renewals
            ├── Simulate refunds
            └── Clear all purchases
```

### Transaction Manager Window

```
┌─────────────────────────────────────────────┐
│ Transaction Manager                         │
├─────────────────────────────────────────────┤
│ supporter_monthly        ✅ Approved        │
│ Date: Oct 9, 2025                          │
│ Renewal: Oct 9, 2025                       │
│                                             │
│ [Refund] [Renew Now] [Clear]               │
└─────────────────────────────────────────────┘
```

---

## ✅ Success Checklist

- [ ] Xcode workspace opened
- [ ] StoreKit Configuration file created
- [ ] 3 products added with correct IDs
- [ ] Subscription group configured
- [ ] Prices set for each tier
- [ ] StoreKit file enabled in scheme
- [ ] Development build installed
- [ ] Test screen shows "Products Available: ✅"
- [ ] All 3 offerings display with prices
- [ ] Test purchase completes successfully
- [ ] Entitlements update after purchase
- [ ] Subscription status changes correctly
- [ ] CustomerInfo listener receives updates

---

## 🐛 Troubleshooting Visual Guide

### Problem: Products Not Loading

```
❌ Before Fix                 ✅ After Fix
┌─────────────────────┐      ┌─────────────────────┐
│ Products Available  │      │ Products Available  │
│ ❌ No               │  →   │ ✅ Yes              │
│                     │      │                     │
│ No offerings        │      │ 🛒 Offerings (3)   │
└─────────────────────┘      └─────────────────────┘

Fix:
1. Clean: Xcode → Product → Clean Build Folder (⇧⌘K)
2. Verify: Edit Scheme → Options → StoreKit selected
3. Rebuild: npx expo run:ios
```

### Problem: Purchase Not Granting Entitlements

```
Purchase Flow:
[Test Purchase] → ✅ Success → ❌ No entitlement granted

Check:
1. RevenueCat Dashboard → Entitlements
2. Verify mapping:
   supporter_monthly → supporter ✅
   (Must match exactly)
3. Check test screen entitlements section
```

### Problem: Product IDs Don't Match

```
RevenueCat Dashboard          StoreKit File
┌──────────────────┐         ┌──────────────────┐
│ supporter_monthly│    ✅    │supporter_monthly │
└──────────────────┘         └──────────────────┘
      (Must match exactly, case-sensitive)

Fix: Copy exact ID from dashboard to StoreKit file
```

---

## 📊 Expected Flow Diagram

```
Start
  │
  ├─→ Create StoreKit File
  │     │
  │     ├─→ Add Products
  │     │     │
  │     │     └─→ Match RevenueCat IDs
  │     │
  │     └─→ Enable in Scheme
  │
  ├─→ Build App (npx expo run:ios)
  │
  ├─→ Open Test Screen
  │     │
  │     ├─→ Verify Products Available ✅
  │     │
  │     └─→ See All Offerings
  │
  ├─→ Test Purchase
  │     │
  │     ├─→ Approve in Xcode
  │     │
  │     └─→ Entitlements Granted ✅
  │
  └─→ Success! All RevenueCat features work 🎉
```

---

## 📚 Documentation Reference

```
docs/revenuecat-testing/
├── QUICK-ANSWER.md          → 30-second answer
├── QUICK-REVENUECAT-SETUP.md → 5-minute setup
├── VISUAL-GUIDE.md          → This file (visual walkthrough)
├── revenuecat-testing-guide.md → Complete reference
├── revenuecat-testing-summary.md → Options comparison
└── README.md                → Navigation index
```

---

## 🚀 Quick Commands Reference

```bash
# Open Xcode
cd ios && open Cadenceday.xcworkspace

# Development build
npx expo run:ios

# Clean build
cd ios && rm -rf build DerivedData && cd ..

# Full clean and rebuild
npx expo prebuild --clean -p ios && npx expo run:ios

# Open RevenueCat Dashboard
open https://app.revenuecat.com
```

---

**You're all set!** Follow the visual steps above and you'll be testing In-App Purchases in minutes. 🎉
