# RevenueCat Dashboard Setup Guide

This guide covers the complete setup of RevenueCat dashboard for managing in-app purchases and subscriptions across iOS and Android platforms.

## Prerequisites

Before starting, ensure you have:
- ✅ RevenueCat account created
- ✅ iOS and Android in-app products created in respective stores (see [Store Setup Guide](STORE_SETUP_GUIDE.md))
- ✅ App Store Connect and Google Play Console access
- ✅ Store Connect API credentials (for iOS)

---

## 🚀 Initial RevenueCat Setup

### 1. Create RevenueCat Account

1. Go to [RevenueCat](https://www.revenuecat.com/)
2. Click **"Sign Up"** and create your account
3. Verify your email address
4. Complete the onboarding flow

### 2. Create a New Project

1. In the RevenueCat dashboard, click **"+ New Project"**
2. Fill in project details:
   ```
   Project Name: Cadence
   Bundle ID (iOS): day.cadence.mobile
   Package Name (Android): day.cadence.mobile
   ```
3. Click **"Create Project"**

---

## 📱 iOS App Configuration

### 1. Connect to App Store Connect

#### Get App Store Connect API Key
1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Navigate to **"Users and Access"** → **"Integrations"** → **"App Store Connect API"**
3. Click **"Generate API Key"**
4. Fill in details:
   ```
   Name: RevenueCat Integration
   Access: Developer
   ```
5. **Download the API key file** (.p8 file)
6. **Note the Key ID and Issuer ID**

#### Configure in RevenueCat
1. In RevenueCat dashboard, go to **"Project Settings"** → **"Integrations"**
2. Click **"Connect"** next to App Store Connect
3. Upload your API key details:
   ```
   Key ID: [Your Key ID from App Store Connect]
   Issuer ID: [Your Issuer ID from App Store Connect]
   Private Key: [Upload your .p8 file]
   ```
4. Click **"Save"**

### 2. Configure iOS App

1. Go to **"Apps"** in RevenueCat dashboard
2. Click **"+ Add App"**
3. Fill in iOS app details:
   ```
   Platform: iOS
   App Name: Cadence
   Bundle ID: day.cadence.mobile
   App Store ID: [Your App Store ID]
   ```
4. Click **"Save"**

---

## 🤖 Android App Configuration

### 1. Connect to Google Play Console

#### Get Google Play Service Account
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable **"Google Play Android Developer API"**
4. Go to **"IAM & Admin"** → **"Service Accounts"**
5. Click **"Create Service Account"**
6. Fill in details:
   ```
   Service Account Name: RevenueCat Integration
   Description: Service account for RevenueCat to access Google Play
   ```
7. Click **"Create and Continue"**
8. Skip roles assignment (will be done in Play Console)
9. Click **"Done"**

#### Generate Service Account Key
1. Click on the created service account
2. Go to **"Keys"** tab
3. Click **"Add Key"** → **"Create New Key"**
4. Select **"JSON"** format
5. Click **"Create"** and **download the JSON file**

#### Grant Permissions in Google Play Console
1. Go to [Google Play Console](https://play.google.com/console)
2. Navigate to **"Setup"** → **"API access"**
3. Click **"Link"** next to your service account
4. Grant the following permissions:
   ```
   - View financial data
   - Manage orders and subscriptions
   - Manage store listing and app configuration
   ```
5. Click **"Apply"**

#### Configure in RevenueCat
1. In RevenueCat dashboard, go to **"Project Settings"** → **"Integrations"**
2. Click **"Connect"** next to Google Play Console
3. Upload your JSON service account key
4. Click **"Save"**

### 2. Configure Android App

1. Go to **"Apps"** in RevenueCat dashboard
2. Click **"+ Add App"**
3. Fill in Android app details:
   ```
   Platform: Android
   App Name: Cadence
   Package Name: day.cadence.mobile
   ```
4. Click **"Save"**

---

## 🛍️ Products Configuration

### 1. Import Products from Stores

RevenueCat should automatically import your products once store connections are established. If not:

#### Manual Product Import
1. Go to **"Products"** in RevenueCat dashboard
2. Click **"+ Add Product"**
3. For each subscription, add:

**Monthly Subscription:**
```
Product ID: cadence_premium_monthly
Store: iOS & Android
Type: Subscription
```

**Yearly Subscription:**
```
Product ID: cadence_premium_yearly
Store: iOS & Android
Type: Subscription
```

### 2. Verify Product Configuration

Ensure your products show up correctly:
- ✅ Product IDs match exactly with store products
- ✅ Both iOS and Android products are visible
- ✅ Product types are set to "Subscription"
- ✅ Pricing information is correctly imported

---

## 🎯 Entitlements Setup

### 1. Create Premium Entitlement

1. Go to **"Entitlements"** in RevenueCat dashboard
2. Click **"+ New Entitlement"**
3. Configure the entitlement:
   ```
   Entitlement ID: premium
   Display Name: Premium Access
   Description: Unlocks all premium features including unlimited habits, advanced analytics, and priority support
   ```
4. Click **"Save"**

### 2. Attach Products to Entitlement

1. In the **"premium"** entitlement settings
2. Click **"Attach Products"**
3. Select both:
   - `cadence_premium_monthly`
   - `cadence_premium_yearly`
4. Click **"Save"**

---

## 🔑 API Keys Setup

### 1. Get API Keys

1. Go to **"Project Settings"** → **"API Keys"**
2. Note your API keys:
   ```
   Public iOS SDK Key: appl_[random_string]
   Public Android SDK Key: goog_[random_string]
   ```

### 2. Add to Environment Variables

Add these keys to your app's environment configuration:

#### For Development (.env.development)
```env
EXPO_PUBLIC_REVENUECAT_IOS_API_KEY=appl_[your_ios_key]
EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY=goog_[your_android_key]
```

#### For Production (Doppler)
1. Go to your [Doppler Dashboard](https://dashboard.doppler.com/)
2. Select your **mobile-app** project
3. Choose **production** environment
4. Add the secrets:
   ```
   EXPO_PUBLIC_REVENUECAT_IOS_API_KEY: appl_[your_ios_key]
   EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY: goog_[your_android_key]
   ```
5. Repeat for **staging** environment

---

## 📊 Analytics and Webhooks

### 1. Configure Analytics

#### Enable Integrations
1. Go to **"Project Settings"** → **"Integrations"**
2. Connect analytics platforms you use:
   - **Mixpanel** (if using)
   - **Amplitude** (if using)
   - **Firebase Analytics** (recommended)

#### Set Up Custom Events
Configure events for tracking:
```
subscription_started
subscription_renewed
subscription_cancelled
subscription_billing_issue
trial_started
trial_converted
```

### 2. Set Up Webhooks (Optional)

For real-time subscription updates:

1. Go to **"Project Settings"** → **"Webhooks"**
2. Click **"+ Add Webhook"**
3. Configure webhook:
   ```
   URL: https://your-api.domain.com/webhooks/revenuecat
   Events: All subscription events
   ```
4. Add webhook signature verification to your backend

---

## 🧪 Testing Configuration

### 1. Sandbox Testing

#### iOS Sandbox
1. Create **Sandbox Apple ID accounts** in App Store Connect
2. Use these accounts for testing in development builds
3. RevenueCat automatically uses sandbox for debug builds

#### Android License Testing
1. Add test Gmail accounts to Google Play Console license testing
2. Set test response to **"PURCHASED"** for subscription testing
3. Use these accounts for testing in development

### 2. RevenueCat Test Environment

#### Create Test Users
1. Go to **"Customer Lists"** in RevenueCat
2. Create test customer profiles for debugging
3. Monitor test transactions in real-time

#### Debug SDK Configuration
In your app, enable debug logging:
```typescript
if (__DEV__) {
  Purchases.setLogLevel(LOG_LEVEL.DEBUG);
}
```

---

## 📈 Monitoring and Analytics

### 1. RevenueCat Dashboard Metrics

Monitor key metrics in RevenueCat:
- **Active Subscriptions**
- **Monthly Recurring Revenue (MRR)**
- **Churn Rate**
- **Trial Conversion Rate**
- **Revenue per User**

### 2. Set Up Alerts

1. Go to **"Project Settings"** → **"Notifications"**
2. Configure alerts for:
   ```
   - Subscription cancellations
   - Failed payment recoveries
   - Trial conversions
   - Revenue milestones
   ```

### 3. Export Data

Set up regular data exports:
1. Go to **"Analytics"** → **"Data Export"**
2. Configure automated exports to:
   - **Google Sheets** (for basic analysis)
   - **BigQuery** (for advanced analytics)
   - **S3** (for data warehousing)

---

## 🔒 Security Best Practices

### 1. API Key Security

- ✅ **Never hardcode API keys** in your app
- ✅ **Use environment variables** for all keys
- ✅ **Rotate keys regularly** (every 6-12 months)
- ✅ **Use different keys** for development/production

### 2. Webhook Security

If using webhooks:
- ✅ **Verify webhook signatures** on your backend
- ✅ **Use HTTPS endpoints** only
- ✅ **Implement idempotency** for duplicate events
- ✅ **Log all webhook events** for debugging

### 3. Customer Data Protection

- ✅ **Follow GDPR requirements** for EU customers
- ✅ **Implement data deletion** capabilities
- ✅ **Encrypt sensitive data** in transit and at rest
- ✅ **Regular security audits** of RevenueCat integration

---

## ✅ Configuration Validation Checklist

### Store Connections
- [ ] App Store Connect API key is connected and active
- [ ] Google Play Console service account is connected
- [ ] Both iOS and Android apps are configured
- [ ] Store products are imported correctly

### Products and Entitlements
- [ ] Monthly subscription product is configured
- [ ] Yearly subscription product is configured
- [ ] "premium" entitlement is created
- [ ] Products are attached to entitlement
- [ ] Product IDs match exactly with store products

### SDK Integration
- [ ] iOS API key is added to environment variables
- [ ] Android API key is added to environment variables
- [ ] RevenueCat SDK is configured in app
- [ ] Debug logging is enabled for development

### Testing
- [ ] Sandbox testing works for iOS
- [ ] License testing works for Android
- [ ] Test purchases can be made successfully
- [ ] Entitlements are granted correctly after purchase
- [ ] Restore purchases functionality works

### Analytics
- [ ] Revenue tracking is working
- [ ] Customer profiles are being created
- [ ] Subscription events are being tracked
- [ ] Analytics integrations are active (if using)

---

## 🚨 Troubleshooting

### Common Issues

**"Store credentials invalid" error:**
- Verify API keys are correctly configured
- Check that service account has proper permissions
- Ensure store products are approved and active

**Products not loading in app:**
- Verify API keys match environment (sandbox vs production)
- Check that product IDs exactly match store products
- Ensure entitlements are properly configured

**Entitlements not being granted:**
- Verify products are attached to entitlements
- Check that purchase receipts are being validated
- Monitor RevenueCat logs for specific errors

**Analytics not tracking:**
- Ensure customer IDs are being set correctly
- Verify webhook endpoints are responding correctly
- Check that analytics integrations are properly configured

### Getting Help

**RevenueCat Support:**
- [Documentation](https://docs.revenuecat.com/)
- [Community Forum](https://community.revenuecat.com/)
- [Support Portal](https://app.revenuecat.com/support)

**Debugging Tools:**
- RevenueCat dashboard customer lookup
- Real-time event logs in dashboard
- SDK debug logging in development
- Store transaction validation tools

---

## 🎯 Next Steps

After completing RevenueCat setup:

1. **Test the complete purchase flow** in your app
2. **Verify entitlements** are being granted correctly
3. **Monitor initial metrics** and user behavior
4. **Set up automated alerts** for important events
5. **Plan A/B testing** for pricing and features
6. **Implement customer support** workflows for billing issues

### Production Launch Checklist

Before going live:
- [ ] All testing completed successfully
- [ ] Production API keys are configured
- [ ] Store products are approved and live
- [ ] Analytics tracking is verified
- [ ] Customer support processes are in place
- [ ] Billing issue resolution procedures are documented

Remember to **monitor your RevenueCat dashboard closely** during the first few weeks after launch to ensure everything is working correctly and to optimize based on user behavior data.