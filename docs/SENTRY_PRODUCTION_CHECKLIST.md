# Sentry Production Deployment Checklist

## 🚀 Quick Start Commands

After setting up your auth token, use these commands for production builds:

```bash
# Build for both platforms
npm run build:prod

# Build for specific platform
npm run build:prod:ios
npm run build:prod:android

# Build preview versions
npm run build:preview

# Submit to app stores
npm run submit:prod

# Validate Sentry CLI setup
npm run sentry:validate
```

## ✅ Pre-Deployment Checklist

### 1. Sentry Configuration

- [ ] **Generate Sentry Auth Token**
  - Go to [Sentry Settings → Auth Tokens](https://sentry.io/settings/auth-tokens/)
  - Create token with `project:read`, `project:write`, `project:releases`, `org:read` scopes
  - Copy the token for next step

- [ ] **Set EAS Secret**

  ```bash
  eas secret:create --scope project --name SENTRY_AUTH_TOKEN --value your_token_here
  ```

- [ ] **Verify Sentry CLI**
  ```bash
  npm run sentry:validate
  ```

### 2. Build Configuration

- [ ] **Check EAS Build Profiles** (`eas.json`)
  - Production profile exists ✓
  - Sentry plugin configured ✓
  - Source maps enabled ✓

- [ ] **Environment Variables**
  - `SENTRY_DSN` in production environment ✓
  - `SENTRY_AUTH_TOKEN` in EAS secrets
  - `EXPO_PUBLIC_ENVIRONMENT=production` for production builds

### 3. Code Verification

- [ ] **Error Handler Integration**
  - GlobalErrorHandler properly integrated ✓
  - Sentry initialization in `app/_layout.tsx` ✓
  - Production configuration enabled ✓

- [ ] **User Feedback**
  - Settings page with feedback options ✓
  - Custom feedback forms working ✓
  - Native Sentry widgets functional ✓

### 4. Testing

- [ ] **Development Testing**
  - App runs without errors ✓
  - Sentry events appear in dashboard ✓
  - User feedback submissions work ✓

- [ ] **Production Build Testing**
  - Build completes successfully
  - Source maps uploaded to Sentry
  - Error tracking works in production
  - Performance monitoring active

## 🔧 Troubleshooting

### Common Issues

1. **Build fails with Sentry errors**
   - Verify `SENTRY_AUTH_TOKEN` is set correctly
   - Check token permissions include all required scopes
   - Run `npm run sentry:validate` to test CLI

2. **Source maps not uploading**
   - Ensure production build profile includes Sentry plugin
   - Verify auth token has `project:write` permission
   - Check build logs for Sentry upload status

3. **Errors not appearing in Sentry**
   - Confirm `SENTRY_DSN` is correct for production
   - Verify app is using production Sentry configuration
   - Check network connectivity in production environment

### Debug Commands

```bash
# Test Sentry CLI connection
npx @sentry/cli info

# List EAS secrets
eas secret:list

# Check build configuration
eas build:configure

# View build logs
eas build:list
```

## 📱 Production Monitoring

Once deployed, monitor these Sentry features:

1. **Error Tracking**
   - Unhandled JavaScript errors
   - Native crashes
   - Custom logged errors via GlobalErrorHandler

2. **Performance Monitoring**
   - App startup time
   - Screen load performance
   - Network request monitoring

3. **User Feedback**
   - Crash reports with user context
   - Manual feedback submissions
   - Custom feedback forms

4. **Release Health**
   - Session tracking
   - User adoption rates
   - Crash-free session rates

## 🎯 Success Metrics

Your Sentry integration is successful when:

- [ ] Build completes with source map uploads
- [ ] Errors appear in Sentry dashboard with proper context
- [ ] User feedback submissions are received
- [ ] Performance data is being collected
- [ ] Release health metrics are populated

## 📞 Support

If you encounter issues:

1. Check the [Sentry Expo Documentation](https://docs.sentry.io/platforms/react-native/manual-setup/expo/)
2. Review [EAS Build troubleshooting](https://docs.expo.dev/build/troubleshooting/)
3. Consult the project's `SENTRY_PRODUCTION_DEPLOYMENT.md` for detailed setup

## 🔄 Regular Maintenance

- **Monthly**: Review error trends and fix common issues
- **Per Release**: Verify source maps upload correctly
- **Quarterly**: Update Sentry SDK and review configuration
- **As Needed**: Adjust error sampling rates based on usage
