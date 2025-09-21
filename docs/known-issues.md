# Known Issues and Solutions

This document contains common issues you might encounter while developing the Cadence.day mobile app and their solutions.

## Database and Supabase Issues

### Supabase PostgreSQL Version Issue

**Problem**: `99_role.sql` errors during local Supabase setup
**Solution**:

```bash
# Change the PostgreSQL version
echo "15.8.1.093" > supabase/.temp/postgres-version
supabase start
```

### Type Generation Failures

**Problem**: `npm run types:update` or `npm run dev:types:update` fails
**Solutions**:

1. **Check Supabase connection**:

   ```bash
   supabase status
   ```

2. **For local development**:

   ```bash
   supabase start
   npm run dev:types:update
   ```

3. **For production**:
   ```bash
   # Ensure you're logged in to Supabase
   supabase login
   npm run types:update
   ```

### Database Migration Issues

**Problem**: Local database out of sync
**Solution**:

```bash
supabase db reset
supabase start
```

## Build and Dependencies

### Metro Bundler Cache Issues

**Problem**: Stale cache causing build errors or hot reload not working
**Solution**:

```bash
# Clear Metro cache
npx expo start -c

# Or manually clear cache
rm -rf node_modules/.cache
rm -rf .expo
```

### Node Modules Issues

**Problem**: Dependency conflicts or missing packages
**Solution**:

```bash
# Clean reinstall
rm -rf node_modules package-lock.json
npm install

# Fix Expo dependencies
npx expo install --fix

# Check for issues
npx expo doctor
```

### iOS Build Failures

**Problem**: iOS build fails with CocoaPods or Xcode errors
**Solutions**:

1. **Clean iOS build**:

   ```bash
   cd ios
   rm -rf build Pods Podfile.lock
   pod install
   cd ..
   ```

2. **Expo prebuild clean**:

   ```bash
   npx expo prebuild --clean -p ios
   ```

3. **Full clean rebuild**:
   ```bash
   rm -rf ios
   npx expo prebuild -p ios
   cd ios && pod install
   ```

### Android Build Failures

**Problem**: Android build fails with Gradle errors
**Solutions**:

1. **Clean Android build**:

   ```bash
   cd android
   ./gradlew clean
   cd ..
   ```

2. **Expo prebuild clean**:

   ```bash
   npx expo prebuild --clean -p android
   ```

3. **Check Java/Android SDK**:

   ```bash
   # Verify Java version (should be 11+)
   java -version

   # Check Android SDK
   echo $ANDROID_HOME
   ```

## Development Environment

### TypeScript Errors

**Problem**: Type checking fails or shows incorrect errors
**Solutions**:

1. **Restart TypeScript server** (VS Code):
   - `Cmd+Shift+P` → "TypeScript: Restart TS Server"

2. **Update types**:

   ```bash
   npm run types:update
   ```

3. **Check tsconfig.json** paths and excludes

### ESLint/Prettier Conflicts

**Problem**: Linting and formatting rules conflict
**Solution**:

```bash
# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Check both
npm run lint && npm run format:check
```

### Hot Reload Not Working

**Problem**: Changes not reflecting in app
**Solutions**:

1. **Restart with cache clear**:

   ```bash
   npx expo start -c
   ```

2. **Check network connection** (for physical devices)

3. **Reload app manually**: Shake device or `Cmd+R`

## Platform-Specific Issues

### iOS Simulator Issues

**Problem**: Simulator not starting or app not installing
**Solutions**:

1. **Reset simulator**:
   - Device → Erase All Content and Settings

2. **Restart simulator**:
   ```bash
   xcrun simctl shutdown all
   xcrun simctl boot "iPhone 14"
   ```

### Android Emulator Issues

**Problem**: Emulator slow or not starting
**Solutions**:

1. **Increase emulator RAM** in Android Studio AVD Manager
2. **Enable hardware acceleration**
3. **Use ARM64 images** for M1 Macs

### Physical Device Issues

**Problem**: App not installing on physical device
**Solutions**:

1. **iOS**: Check provisioning profile and signing
2. **Android**: Enable Developer Options and USB Debugging
3. **Both**: Ensure device and computer are on same network

## Authentication and Environment

### Clerk Authentication Issues

**Problem**: Authentication not working
**Solutions**:

1. **Check environment variables**:

   ```bash
   echo $EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY
   ```

2. **Verify Clerk configuration** in dashboard
3. **Clear app data** and re-authenticate

### Environment Variable Issues

**Problem**: Environment variables not loading
**Solutions**:

1. **Check file naming**:
   - Development: `.env.development`
   - Production: Use Doppler or `.env`

2. **Restart development server** after changing env vars

3. **Verify variable names** start with `EXPO_PUBLIC_`

## Performance Issues

### App Running Slowly

**Problem**: App performance degraded
**Solutions**:

1. **Enable Hermes** (already enabled in expo config)
2. **Check for memory leaks** in useEffect hooks
3. **Optimize large lists** with FlatList
4. **Use development build** instead of Expo Go for better performance

### Large Bundle Size

**Problem**: App bundle too large
**Solutions**:

1. **Analyze bundle**:

   ```bash
   npx expo export --dump-sourcemap
   ```

2. **Remove unused dependencies**
3. **Use dynamic imports** for large features

## Debugging Tips

### Enable Debug Mode

```bash
# iOS Simulator
Cmd+D → "Debug JS Remotely"

# Android Emulator
Cmd+M → "Debug JS Remotely"
```

### View Logs

```bash
# Expo logs
npx expo logs

# iOS logs
npx expo logs --platform ios

# Android logs
npx expo logs --platform android
```

### Network Debugging

1. **Use Flipper** for network inspection
2. **Check Supabase dashboard** for API errors
3. **Enable verbose logging** in development

## When All Else Fails

### Nuclear Reset

If you're experiencing persistent issues:

```bash
# Complete clean slate
rm -rf node_modules package-lock.json ios android .expo
npm install
npx expo install --fix
npx expo prebuild --clean
```

### Check Versions

Ensure you're using compatible versions:

```bash
# Check Expo SDK version
npx expo --version

# Check Node version
node --version

# Check npm version
npm --version
```

## Getting Help

1. **Check this document first**
2. **Search GitHub issues** in the repository
3. **Expo documentation**: https://docs.expo.dev/
4. **Supabase documentation**: https://supabase.com/docs
5. **Ask the team** in development channels

## Contributing to This Document

Found a new issue and solution? Please add it to this document with:

- Clear problem description
- Step-by-step solution
- Any relevant code snippets or commands
