# Cadence App

<img width="4800" height="1920" alt="Github Repo Banner" src="https://github.com/user-attachments/assets/e46ae404-e70f-4066-aecc-2469cf02f2fe" />

A React Native mobile app for activity tracking, note-taking, and personal productivity/reflection management.

Checkout more details on [cadence.day](https://cadence.day)
Get access to FAQ/Blog and Docs on [docs.cadence.day](https://docs.cadence.day)

## 🚀 Quick Start

1. **Prerequisites**: Node.js 22, npm, Expo CLI
2. **Install**: `npm install`
3. **Environment**: integrated with Doppler
4. **Clean Start**: `npm run clean`
5. **Run**: `npm run ios` or `npm run android`

**📖 [Full Setup Guide](docs/getting-started.md)** | **🐛 [Known Issues](docs/known-issues.md)**

## 🏗️ Architecture

- **Feature-based**: Modular features in `features/` with their own components, hooks, services, stores, api, ...
- **Shared foundation**: Common UI, stores, utils, api client, constants, styles in `shared/`
- **Type-safe**: Auto-generated Supabase types + TypeScript throughout
- **State management**: Zustand stores with consistent API patterns
- **Error handling**: Integrated error Logging system with custom user feedback using toasts and dialogs.

**📖 [Architecture Guide](docs/feature-architecture.md)** | **📖 [Coding Standards](docs/coding-standards.md)**

## 🛠️ Tech Stack

- **React Native + Expo**: Cross-platform mobile development
- **TypeScript**: Type safety and developer experience
- **Zustand**: Lightweight state management
- **Supabase**: Backend, database, authentication
- **Clerk**: User authentication and management
- **Sentry**: Error tracking and monitoring
- **Posthog**: Feature flag system
- **Doppler**: Environment variables manager

> - Check [cadence-docs](/cadence-docs/README.md) for its own Stack
> - Check [supabase](/supabase/README.md) for our database information

---

## 📝 Development Scripts

| Command                    | Description                        |
| -------------------------- | ---------------------------------- |
| `npm start`                | Start development server           |
| `npm run ios`              | Run on iOS device/simulator        |
| `npm run android`          | Run on Android device/emulator     |
| `npm run web`              | Run web version                    |
| `npm run lint`             | Check code style                   |
| `npm run lint:fix`         | Fix linting issues                 |
| `npm run format`           | Format code with Prettier          |
| `npm test`                 | Run tests in watch mode            |
| `npm run typescript`       | Type check                         |
| `npm run types:update`     | Update Supabase types (production) |
| `npm run dev:types:update` | Update Supabase types (local)      |

## 📁 Project Structure

```
features/             # Feature modules
  activity/           # Activity tracking
    components/       # Feature-specific components
    dialogs/          # Feature dialogs
    hooks/            # Feature hooks
    index.ts          # Public API
    types.ts          # Feature types
    styles.ts         # Specific styling elements
    utils.ts          # Feature utilities

shared/               # Shared code
  api/                # API clients
  components/         # Reusable UI components
  dialogs/            # Dialog system
  stores/             # Zustand stores
  types/              # Shared TypeScript types
  utils/              # Shared utilities
  styles/             # Shared Styling
  constants/          # Shared Constants

app/                  # Expo Router routes
supabase/             # Database config & migrations
cadence-docs/         # Blogging, FAQ, Developers documentation
```

## 🏗️ Building & Deployment

- **Development builds**: Use Expo CLI with `npm run ios` / `npm run android`
- **Production builds**: `eas build --platform ios|android --profile production`
- **Updates**: `npm run eas:update` for over-the-air updates
- **Submission**: `eas submit --platform ios|android`

## 📚 Documentation

- **[Getting Started](docs/getting-started.md)** - Complete setup guide
- **[Feature Architecture](docs/feature-architecture.md)** - How to structure features
- **[Dialog System](docs/dialog-system.md)** - Creating and using dialogs
- **[Coding Standards](docs/coding-standards.md)** - Code conventions and patterns
- **[Known Issues](docs/known-issues.md)** - Common problems and solutions

## 🤝 Contributing

1. Follow the [coding standards](docs/coding-standards.md)
2. Keep features isolated and self-contained
3. Use TypeScript for all new code
4. Include tests for critical functionality
5. Update documentation for new features

---

**Team**: [Oleg Moshkovich](https://github.com/OlegMoshkovich) • [Bruno Adam](https://github.com/bruadam)
