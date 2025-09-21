# Sentry Production Deployment Guide

This guide walks you through setting up Sentry for production deployment with Expo and EAS Build.

## Prerequisites

1. **Sentry Account & Project**: Ensure you have a Sentry account with the `cadence-app` project
2. **Sentry Auth Token**: Generate an auth token with the necessary permissions
3. **EAS CLI**: Install and configure EAS CLI

## Step-by-Step Setup

### 1. Generate Sentry Auth Token

1. Go to [Sentry Settings > Auth Tokens](https://sentry.io/settings/account/api/auth-tokens/)
2. Click "Create New Token"
3. Name: `cadence-app-production`
4. Scopes needed:
   - `project:read`
   - `project:write`
   - `project:releases`
   - `org:read`
5. Copy the generated token

### 2. Set Environment Variables in EAS

#### Option A: EAS Secrets (Recommended)

```bash
# Set the Sentry auth token as a secret
eas secret:create --scope project --name SENTRY_AUTH_TOKEN --value "your_token_here"

# Verify secrets
eas secret:list
```

#### Option B: Local Environment Files

Add to your `.env.production` file:

```bash
SENTRY_AUTH_TOKEN="your_sentry_auth_token_here"
```

### 3. Build for Production

```bash
# Build for iOS production
eas build --platform ios --profile production

# Build for Android production
eas build --platform android --profile production

# Build for both platforms
eas build --platform all --profile production
```

### 4. Verify Sentry Integration

After deployment, verify that:

1. **Source Maps**: Check Sentry dashboard for uploaded source maps
2. **Releases**: Verify new release appears in Sentry
3. **Error Tracking**: Test error reporting works
4. **User Feedback**: Test feedback functionality
5. **Performance**: Check performance monitoring data

## Configuration Details

### Sentry Expo Plugin Configuration

The `app.json` includes:

```json
{
  "plugins": [
    [
      "@sentry/react-native/expo",
      {
        "url": "https://sentry.io/",
        "project": "cadence-app",
        "organization": "cadenceday"
      }
    ]
  ]
}
```

### App Configuration

Key Sentry settings in `app/_layout.tsx`:

```typescript
Sentry.init({
  dsn: SECRETS.EXPO_PUBLIC_SENTRY_DSN,
  enabled: true, // Always enabled
  environment: getIsDev() ? "development" : "production",
  release: "cadence-app@2.0.0",
  tracesSampleRate: getIsDev() ? 1.0 : 0.1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  attachScreenshot: true,
  attachViewHierarchy: true,
});
```

## Testing Production Builds

### 1. Test Error Tracking

```typescript
// Trigger test error
import { GlobalErrorHandler } from "@/shared/utils/errorHandler";

GlobalErrorHandler.logError(
  new Error("Production test error"),
  "ProductionTest.errorTracking"
);
```

### 2. Test User Feedback

```typescript
// Test feedback submission
import * as Sentry from "@sentry/react-native";

Sentry.showFeedbackWidget();
```

### 3. Test Performance Monitoring

- Navigate between screens
- Perform app operations
- Check Sentry Performance dashboard

## Production Checklist

### Before Deployment:

- [ ] Sentry auth token configured in EAS secrets
- [ ] Production environment variables set
- [ ] Sentry organization/project configured correctly
- [ ] Source map upload enabled
- [ ] Release tracking configured

### After Deployment:

- [ ] Source maps appear in Sentry dashboard
- [ ] New release appears in Sentry
- [ ] Test error reporting functionality
- [ ] Test user feedback functionality
- [ ] Verify performance monitoring
- [ ] Check user session replays

### During Development:

- [ ] Use staging/preview builds to test Sentry integration
- [ ] Test feedback forms and error reporting
- [ ] Verify source maps work correctly
- [ ] Test offline error caching

## Monitoring & Alerts

### Set up Sentry Alerts for:

1. **Error Rate Threshold**: Alert when error rate exceeds normal levels
2. **New Issues**: Get notified of new types of errors
3. **Performance Degradation**: Alert on slow transactions
4. **Release Health**: Monitor crash-free session rates

### Configure Slack/Email Notifications:

1. Go to Sentry Project Settings > Alerts
2. Create alert rules for critical issues
3. Set up notification channels (Slack, email, etc.)

## Troubleshooting

### Common Issues:

1. **Source Maps Not Uploading**:
   - Check SENTRY_AUTH_TOKEN is set correctly
   - Verify organization/project names match
   - Check build logs for Sentry upload errors

2. **Events Not Appearing**:
   - Verify DSN is correct
   - Check network connectivity
   - Ensure `enabled: true` in Sentry config

3. **Performance Data Missing**:
   - Check `tracesSampleRate` is > 0
   - Verify performance monitoring is enabled
   - Check for network issues

4. **Feedback Widget Not Working**:
   - Ensure root component is wrapped with `Sentry.wrap()`
   - Check React Native Modal compatibility
   - Verify feedback integration is configured

## Resources

- [Sentry React Native Documentation](https://docs.sentry.io/platforms/react-native/)
- [Sentry Expo Plugin Documentation](https://docs.expo.dev/guides/using-sentry/)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [Sentry Release Management](https://docs.sentry.io/product/releases/)

## Support

For issues with this Sentry setup:

1. Check the [troubleshooting section](#troubleshooting) above
2. Review Sentry documentation
3. Check EAS build logs
4. Contact the development team
