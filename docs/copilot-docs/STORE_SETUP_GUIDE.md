# Store Setup Guide for In-App Purchases

This guide covers the complete setup process for in-app purchases and subscriptions on both App Store Connect (iOS) and Google Play Console (Android).

## Prerequisites

Before starting, ensure you have:
- ✅ Developer accounts for both Apple App Store and Google Play Store
- ✅ App IDs created in both stores
- ✅ RevenueCat account (covered in [RevenueCat Setup Guide](REVENUECAT_SETUP_GUIDE.md))
- ✅ Tax and banking information configured in both stores

---

## 📱 iOS - App Store Connect Setup

### 1. Access App Store Connect

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Sign in with your Apple Developer account
3. Navigate to **"My Apps"**
4. Select your **Cadence** app

### 2. Set Up Agreements, Tax, and Banking

⚠️ **Critical**: In-app purchases won't work without proper agreements.

1. Navigate to **"Agreements, Tax, and Banking"**
2. Complete the **"Paid Applications"** agreement
3. Add your **banking information**
4. Set up **tax information** for all relevant territories
5. Ensure status shows **"Active"** for paid applications

### 3. Create In-App Purchase Products

#### Navigate to In-App Purchases
1. In your app, go to **"Features"** → **"In-App Purchases"**
2. Click **"Manage"** next to In-App Purchases

#### Create Monthly Subscription
1. Click **"+"** (Add In-App Purchase)
2. Select **"Auto-Renewable Subscription"**
3. Fill in the details:

**Product Details:**
```
Product ID: cadence_premium_monthly
Reference Name: Deep Cadence Premium Monthly
Subscription Group: premium_subscriptions (create new if needed)
```

**Subscription Duration:**
```
Subscription Duration: 1 Month
```

**Price and Availability:**
```
Price: Select your desired monthly price tier (e.g., $9.99)
Availability: Available in all territories
```

**App Store Localization:**
```
Display Name: Deep Cadence Premium
Description: Unlock unlimited habit tracking, advanced analytics, custom reminders, and premium features to supercharge your daily reflection journey.
```

**Review Information:**
```
Screenshot: Upload a screenshot showing the subscription benefits
Review Notes: Premium subscription unlocks unlimited habits, advanced analytics, custom reminders, data export, theme customization, and priority support.
```

4. **Save** the product

#### Create Yearly Subscription
1. Click **"+"** (Add In-App Purchase)
2. Select **"Auto-Renewable Subscription"**
3. Fill in the details:

**Product Details:**
```
Product ID: cadence_premium_yearly
Reference Name: Deep Cadence Premium Yearly
Subscription Group: premium_subscriptions (same as monthly)
```

**Subscription Duration:**
```
Subscription Duration: 1 Year
```

**Price and Availability:**
```
Price: Select yearly price tier (e.g., $79.99 - roughly 33% savings)
Availability: Available in all territories
```

**App Store Localization:**
```
Display Name: Deep Cadence Premium (Annual)
Description: Save 33% with our annual plan! Unlock unlimited habit tracking, advanced analytics, custom reminders, and all premium features.
```

4. **Save** the product

### 4. Configure Subscription Group

1. In **Subscription Group Settings**:
   ```
   Group Name: Premium Subscriptions
   ```

2. Set up **Subscription Levels**:
   - Both monthly and yearly should be at the **same service level**
   - Users can upgrade/downgrade between them

### 5. Set Up Free Trial (Optional)

For each subscription:
1. Go to **"Subscription Prices"**
2. Click **"Add Introductory Price"**
3. Configure:
   ```
   Type: Free Trial
   Duration: 7 days
   Territories: All territories
   ```

### 6. Submit for Review

1. **Complete all required fields** for each product
2. **Add screenshots** showing subscription benefits
3. **Submit each subscription** for App Store review
4. Wait for **approval** (usually 24-48 hours)

---

## 🤖 Android - Google Play Console Setup

### 1. Access Google Play Console

1. Go to [Google Play Console](https://play.google.com/console)
2. Sign in with your Google account
3. Select your **Cadence** app

### 2. Set Up Merchant Account

⚠️ **Critical**: Required for paid apps and subscriptions.

1. Navigate to **"Monetize"** → **"Monetization setup"**
2. Set up a **Google Merchant account**
3. Add **payment methods** and **tax information**
4. Verify your merchant account is **active**

### 3. Create Subscription Products

#### Navigate to Subscriptions
1. Go to **"Monetize"** → **"Subscriptions"**
2. Click **"Create subscription"**

#### Create Monthly Subscription
1. **Product details:**
   ```
   Product ID: cadence_premium_monthly
   Name: Deep Cadence Premium Monthly
   Description: Unlock unlimited habit tracking, advanced analytics, custom reminders, data export, theme customization, and priority support.
   ```

2. **Base plan:**
   ```
   Base plan ID: monthly-base
   Billing period: 1 month
   Price: $9.99 USD (or your preferred price)
   ```

3. **Eligibility:**
   ```
   Countries/regions: Select all countries where you want to offer the subscription
   ```

4. **Free trial (Optional):**
   ```
   Offer ID: monthly-trial
   Duration: 7 days
   ```

5. **Save** and **Activate**

#### Create Yearly Subscription
1. Click **"Create subscription"**
2. **Product details:**
   ```
   Product ID: cadence_premium_yearly
   Name: Deep Cadence Premium Yearly
   Description: Save 33% with our annual plan! Unlock unlimited habit tracking, advanced analytics, custom reminders, and all premium features.
   ```

3. **Base plan:**
   ```
   Base plan ID: yearly-base
   Billing period: 1 year
   Price: $79.99 USD (or your preferred price)
   ```

4. **Eligibility:**
   ```
   Countries/regions: Select all countries where you want to offer the subscription
   ```

5. **Free trial (Optional):**
   ```
   Offer ID: yearly-trial
   Duration: 7 days
   ```

6. **Save** and **Activate**

### 4. Configure Subscription Settings

#### Set Up Grace Periods
1. Go to **"Subscriptions"** → **"Settings"**
2. Configure **grace periods**:
   ```
   Account hold: 30 days
   Grace period: 3 days
   ```

#### Configure Cancellation Survey
1. Enable **cancellation survey** to understand why users cancel
2. Add custom questions specific to your app

### 5. Test Subscription Products

#### Set Up License Testing
1. Go to **"Setup"** → **"License testing"**
2. Add **test Gmail accounts**
3. Configure **test response** for purchases

#### Test Purchase Flow
1. Install your app via **internal testing** track
2. Sign in with a **test account**
3. Attempt to **purchase subscriptions**
4. Verify the **purchase flow** works correctly

---

## 🔍 Product Validation Checklist

### Before Going Live

**iOS App Store:**
- [ ] Agreements, Tax, and Banking are completed and active
- [ ] Both subscription products are created with correct Product IDs
- [ ] Products are in the same subscription group
- [ ] Localizations are complete for all supported languages
- [ ] Screenshots and descriptions are added
- [ ] Products are submitted for review and approved
- [ ] Free trial periods are configured (if desired)

**Google Play Console:**
- [ ] Merchant account is set up and verified
- [ ] Both subscription products are created and activated
- [ ] Base plans are configured with correct billing periods
- [ ] Pricing is set for all target countries
- [ ] Free trial offers are created (if desired)
- [ ] License testing is configured for development
- [ ] Products are tested with test accounts

**App Configuration:**
- [ ] Product IDs in app match exactly with store products
- [ ] RevenueCat dashboard is configured with correct store products
- [ ] Environment variables are set with correct RevenueCat API keys
- [ ] App builds successfully with subscription features

### Testing Recommendations

1. **Sandbox Testing (iOS):**
   - Create sandbox Apple ID accounts
   - Test subscription purchase flow
   - Test subscription management
   - Test restore purchases
   - Test subscription expiration and renewal

2. **License Testing (Android):**
   - Use test Gmail accounts
   - Test all subscription scenarios
   - Verify billing cycles work correctly
   - Test grace periods and account holds

3. **Cross-Platform Testing:**
   - Verify subscriptions work on both platforms
   - Test account switching between devices
   - Ensure consistent pricing across platforms
   - Test offline/online subscription state

---

## 💡 Best Practices

### Pricing Strategy
- **Research competitors** to find optimal pricing
- **Consider regional pricing** for different markets
- **Offer annual discount** (typically 15-30% savings)
- **A/B testing** different price points
- **Psychological pricing** (e.g., $9.99 vs $10.00)

### Subscription Management
- **Clear value proposition** in product descriptions
- **Transparent billing** information
- **Easy cancellation** process
- **Proactive communication** about billing
- **Grace periods** for failed payments

### Store Optimization
- **High-quality screenshots** showing premium features
- **Compelling descriptions** highlighting benefits
- **Regular price testing** and optimization
- **Monitor conversion rates** and adjust accordingly
- **Respond to user reviews** about pricing/subscriptions

### Compliance Considerations
- **Regional tax compliance** for all territories
- **GDPR compliance** for EU users
- **Clear terms of service** for subscriptions
- **Privacy policy** updates for payment data
- **Age restrictions** if applicable

---

## 🚨 Troubleshooting Common Issues

### iOS Issues

**"Agreements not complete" error:**
- Complete all required agreements in App Store Connect
- Ensure banking information is added and verified
- Check that tax information is complete for all territories

**Products not appearing in app:**
- Verify Product IDs match exactly (case-sensitive)
- Ensure products are approved and active
- Check that app bundle ID matches App Store Connect
- Clear app cache and reinstall for testing

**Subscription group issues:**
- Ensure both products are in the same subscription group
- Verify subscription levels are set correctly
- Check that upgrade/downgrade paths are configured

### Android Issues

**"Merchant account required" error:**
- Complete Google Merchant account setup
- Verify banking and tax information
- Ensure merchant account is approved and active

**Products not loading:**
- Verify Product IDs match exactly
- Ensure products are activated in Play Console
- Check that app is signed with the correct key
- Test with license testing enabled

**Billing issues:**
- Verify base plans are configured correctly
- Check that billing periods are set properly
- Ensure pricing is set for target countries

### RevenueCat Issues

**Configuration not working:**
- Verify API keys are correct for each platform
- Ensure products are configured in RevenueCat dashboard
- Check that entitlements are set up correctly
- Monitor RevenueCat logs for specific error messages

---

## 📞 Support Resources

### Apple Support
- [App Store Connect Help](https://help.apple.com/app-store-connect/)
- [In-App Purchase Programming Guide](https://developer.apple.com/in-app-purchase/)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)

### Google Support
- [Google Play Console Help](https://support.google.com/googleplay/android-developer/)
- [Play Billing Documentation](https://developer.android.com/google/play/billing)
- [Play Store Policy Center](https://play.google.com/about/developer-content-policy/)

### RevenueCat Support
- [RevenueCat Documentation](https://docs.revenuecat.com/)
- [RevenueCat Community](https://community.revenuecat.com/)
- [RevenueCat Support](https://app.revenuecat.com/support)

---

## 🎯 Next Steps

After completing store setup:

1. **Configure RevenueCat Dashboard** → See [RevenueCat Setup Guide](REVENUECAT_SETUP_GUIDE.md)
2. **Set environment variables** with your RevenueCat API keys
3. **Test the complete purchase flow** in development
4. **Submit app for review** with in-app purchases enabled
5. **Monitor analytics** and subscription metrics
6. **Optimize based on user feedback** and conversion data

Remember to **keep your store listings updated** and **monitor subscription performance** regularly to ensure optimal user experience and revenue generation.