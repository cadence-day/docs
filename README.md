# 🧭 Cadence.day Mobile App

![Cadence Logo](assets/images/splash-icon.png)

A React Native mobile app for activity tracking, note-taking, and personal productivity/reflection management.

Checkout more details on [cadence.day](https://cadence.day)

## 🚀 Quick Start

1. **Prerequisites**: Node.js 18+, npm, Expo CLI
2. **Install**: `npm install`
3. **Environment**: Copy `.env.example` → `.env.development` and configure
4. **Start**: `npm start`
5. **Run**: `npm run ios` or `npm run android`

> Note: Android has not been tested yet.

**📖 [Full Setup Guide](docs/getting-started.md)** | **🐛 [Known Issues](docs/known-issues.md)**

## 🏗️ Architecture

- **Feature-based**: Modular features in `features/` with their own components, hooks, services
- **Shared foundation**: Common UI, stores, utils in `shared/`
- **Type-safe**: Auto-generated Supabase types + TypeScript throughout
- **State management**: Zustand stores with consistent API patterns
- **Error handling**: Global error system with user feedback using toasts and dialogs.

**📖 [Architecture Guide](docs/feature-architecture.md)** | **📖 [Coding Standards](docs/coding-standards.md)**

## 🛠️ Tech Stack

- **React Native + Expo**: Cross-platform mobile development
- **TypeScript**: Type safety and developer experience
- **Zustand**: Lightweight state management
- **Supabase**: Backend, database, authentication
- **Clerk**: User authentication and management
- **Sentry**: Error tracking and monitoring

---

MIT License

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
features/               # Feature modules
  activity/            # Activity tracking
    components/        # Feature-specific components
    dialogs/          # Feature dialogs
    hooks/            # Feature hooks
    index.ts          # Public API
    types.ts          # Feature types
    utils.ts          # Feature utilities

shared/                # Shared code
  api/                 # API clients
  components/          # Reusable UI components
  dialogs/            # Dialog system
  stores/             # Zustand stores
  types/              # Shared TypeScript types
  utils/              # Shared utilities

app/                   # Expo Router routes
supabase/             # Database config & migrations
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

## 📄 License

MIT License - see LICENSE file for details

---

**Team**: [Oleg Moshkovich](https://github.com/OlegMoshkovich) • [Bruno Adam](https://github.com/bruadam)
