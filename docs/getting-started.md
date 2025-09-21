# Getting Started with Cadence.day Mobile App

This guide will help you set up the development environment and get the app running locally.

## Prerequisites

### Required Software

- **Node.js**: Version 18 or higher ([Download](https://nodejs.org/))
- **npm**: Comes with Node.js
- **Git**: For version control
- **Expo CLI**: `npm install -g @expo/cli`

### Platform-Specific Requirements

#### iOS Development

- **macOS**: Required for iOS development
- **Xcode**: Latest version from App Store
- **iOS Simulator**: Included with Xcode
- **CocoaPods**: `sudo gem install cocoapods`

#### Android Development

- **Android Studio**: For Android SDK and emulator
- **Java Development Kit (JDK)**: Version 11 or higher
- **Android SDK**: API level 33 or higher
- **Android Emulator**: Set up through Android Studio

## Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/cadence-day/cadence-app.git
cd cadence-app
```

### 2. Install Dependencies

```bash
npm install
```

If you encounter peer dependency warnings:

```bash
npm install --legacy-peer-deps
```

### 3. Environment Configuration

#### Option A: Using .env Files (Recommended for Development)

1. Copy the example environment file:

   ```bash
   cp .env.example .env.development
   ```

2. Edit `.env.development` with your configuration:

   ```bash
   # Supabase Configuration
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

   # Clerk Authentication
   EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key

   # Other configurations...
   ```

#### Option B: Using Doppler (Production)

If you have access to Doppler secrets:

```bash
npx doppler run -- npm start
```

### 4. Database Setup (Optional for Local Development)

#### Using Local Supabase

1. Install Supabase CLI:

   ```bash
   npm install -g supabase
   ```

2. Start local Supabase:

   ```bash
   supabase start
   ```

3. Update types from local database:
   ```bash
   npm run dev:types:update
   ```

#### Using Remote Supabase

Update types from production database:

```bash
npm run types:update
```

### 5. Start the Development Server

```bash
npm start
```

This will start the Expo development server. You'll see a QR code and options to run on different platforms.

### 6. Run on Device/Simulator

#### iOS

```bash
npm run ios
```

#### Android

```bash
npm run android
```

#### Web (for testing)

```bash
npm run web
```

## Development Workflow

### Hot Reloading

The app supports hot reloading. Changes to your code will automatically refresh the app while preserving state.

### Switching Between Development Build and Expo Go

In the Expo terminal, press `s` to switch between:

- **Development build**: Full native functionality
- **Expo Go**: Quick testing (limited native features)

### Type Checking

Run TypeScript type checking:

```bash
npm run typescript
```

### Code Quality

Before committing code:

```bash
npm run lint
npm run format:check
npm run typescript
```

Auto-fix issues:

```bash
npm run lint:fix
npm run format
```

## Common Setup Issues

### Node Version Issues

If you encounter Node.js version conflicts:

```bash
# Using nvm (recommended)
nvm install 18
nvm use 18

# Or update Node.js directly
```

### iOS Build Issues

```bash
# Clean iOS build
cd ios && rm -rf build Pods Podfile.lock
pod install
cd ..
```

### Android Build Issues

```bash
# Clean Android build
cd android
./gradlew clean
cd ..
```

### Dependency Issues

```bash
# Clean reinstall
rm -rf node_modules package-lock.json
npm install
```

### Supabase Connection Issues

1. Verify your environment variables are correct
2. Check network connectivity
3. Ensure Supabase project is active

## Next Steps

- Read the [Feature Architecture Guide](feature-architecture.md) to understand how features are structured
- Check [Coding Standards](coding-standards.md) for development conventions
- Review [Known Issues](known-issues.md) for common problems and solutions
- Explore the [Dialog System](dialog-system.md) for creating UI dialogs

## Getting Help

- Check the [Known Issues](known-issues.md) documentation
- Review existing GitHub issues
- Ask questions in team channels
- Consult the [Expo documentation](https://docs.expo.dev/)
