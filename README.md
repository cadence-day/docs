# 🧭 Cadence.day Mobile App

![Cadence Logo](assets/images/splash-icon.png)


[![Auto Format on PR](https://github.com/cadence-day/cadence-mobile-app/actions/workflows/formating.yml/badge.svg)](https://github.com/cadence-day/cadence-mobile-app/actions/workflows/formating.yml)
[![EAS Staging Build](https://github.com/cadence-day/cadence-mobile-app/actions/workflows/preview.yml/badge.svg)](https://github.com/cadence-day/cadence-mobile-app/actions/workflows/preview.yml)

## 📱 Overview

The **Cadence.day Mobile App** is a cross-platform application built with **React Native**, **TypeScript**, and **Expo**. It runs seamlessly on both **iOS** and **Android** and is designed to provide a clean, scalable, and testable development environment.

---

## ⚙️ Tech Stack

- **React Native**: Build native apps using React.
- **TypeScript**: Strongly typed JavaScript for better scalability and safety.
- **Expo**: A powerful platform and framework for building universal React Native apps.
- **React Navigation**: Handle navigation across screens.
- **zustand**: A minimal, efficient state-management library.
- **LangChain**: For AI interactions and thread management.
- **Supabase**: For backend services and database management.
- **Doppler**: For secure environment variable management.

---

## 🚀 Getting Started

To set up your local development environment and start contributing:

### 1. Clone the Repository

```bash
git clone https://github.com/cadence-day/cadence-mobile-app.git
```

### 2. Navigate to the Project Folder

```bash
cd cadence-mobile-app
```

### 3. Install Dependencies

Using **npm**:

```bash
npm install
```

### 4. Run the App locally

Follow the [Expo setup guide](https://docs.expo.dev/get-started/set-up-your-environment/) to configure your environment.

#### For Development with Local Environment (.env.development)

Use these commands to run with your local `.env.development` file:

```bash
# Start with development environment (uses .env.development)
npm run start:dev

# iOS simulator with development environment
npm run ios:dev

# Android emulator with development environment
npm run android:dev
```

#### For Production Environment (Doppler)

Use these commands to run with Doppler secrets:

```bash
# Start with Doppler secrets (production/staging)
npm start

# iOS with Doppler
npm run ios

# Android with Doppler
npm run android
```

> ℹ️ Press `s` in the terminal to switch between **development build** and **Expo Go**.

📚 **For detailed environment setup**: See [Environment Configuration Guide](docs/ENVIRONMENT_SETUP.md)

Note: Doppler is injecting environment variables on the start script. If you have problems with Doppler, first check this [Environment Variables with Doppler](#environment-variables-with-doppler) section.

### 5. Update the Expo Go app

```bash
npm run eas:update
```
> ℹ️ This command will update the Expo Go with the latest changes and pass the secrets to the app from Doppler.

---

## Supabase Setup

1. Install the Supabase CLI if you haven't already:

```bash
brew install supabase/tap/supabase
```

2. Log in to your Supabase account:

```bash
supabase login
```

3. Make sure Docker is running on your machine, as Supabase CLI uses Docker to run the local instance.
To download the Docker Daemon on macOS, you can use Homebrew:

```bash
brew install --cask docker
```
> If you do not want to user Docker, you can use colima running the following command: `brew install colima && colima start`
4. Start the local Supabase instance:

```bash
supabase start
```

5. Make sure you have the `.env.development` file set up with your Supabase credentials. You can find these in your Supabase project settings.

```
SUPABASE_URL=<your-supabase-url>
SUPABASE_API_KEY=<your-supabase-anon-key>
```

ℹ️ You can find the API URL and API key (ANON KEY) by running the following command:

```bash
supabase status
```

6. To be sure the database is up to date, run the following command:

```bash
supabase db reset
```

Wuuhuu! 🎉 Your local Supabase instance is now running, and you can start developing with it.

**One more thing**, if you want to update the database types: 

```bash
npm run dev:types:update
```

## Add data in the local Supabase instance

You can add data using SQL in the file `supabase/seed.sql`.

> 🚧 If Supabase results in unhealthy conditions: run the following command: 
```bash
docker stop $(docker ps -a -q)
docker rm $(docker ps -a -q)
docker rmi $(docker images -q)
supabase start
```

> 🚧 If there is a 99_role.sql issue, change the `supabase/.temp/postgres-version`to 15.8.1.093. There are known and unresolved issues with the 94 patched version. 

---

## 🔐 Environment Variables with Doppler

This project uses [Doppler](https://dashboard.doppler.com/workplace/7d34d4a9994a7edb86e1/projects) to securely manage environment variables.

### 🚀 Quick Setup

0. **Install Doppler CLI**

- Follow the [installation guide](https://docs.doppler.com/docs/install-cli) to install the Doppler CLI.

For MacOS, you can use Homebrew for a quick installation:

```bash
# Install gnupg if you don't have it already
brew install gnupg
# Install Doppler CLI
brew install dopplerhq/cli/doppler
# Verify the installation
doppler --version
# Update Doppler CLI to the latest version
doppler update
```

1. **Login to Doppler**

```bash
doppler login
```

> ℹ️ Use Github Cadence Dev Account to login.

2. **Project is already linked**

This repo uses the Doppler project: `mobile-app`
The `.doppler.yaml` file handles the link — no setup needed.

### 🔑 Want to add a new secret?

1. **Add new variables on Doppler**

Go to: [Doppler Dashboard → mobile-app](https://dashboard.doppler.com/workplace/7d34d4a9994a7edb86e1/projects/mobile-app)
→ Choose an environment (`dev`) is the one used for development.
→ Click **"Add Secret"**
→ `MY_SECRET` (or any name you prefer)
→ `MY_SECRET_VALUE` (or any value you prefer)
→ Click **"Save"**
→ Select `staging` and `production` environments and click **"Save"**

4. **Add a new environment variable in the `app.config.js` file**

```javascript
export default ({ config }) => ({
  ...config,
  expo: {
    // ... other config
    extra: {
      // ... other secrets
      MY_SECRET: process.env.MY_SECRET,
    },
  },
});
```

5. **Add the variable in the[`constants/SECRETS.ts`](constants/SECRETS.ts)**

```ts
export const SECRETS = {
   // ... other secrets
   MY_SECRET: Constants.expoConfig?.extra?.MY_SECRET ?? "",
   };
```

6. **Access the variable in your code**

```tsx
import { SECRETS } from "../constants/SECRETS";

MY_SECRET = SECRETS.MY_SECRET;
```

TADAAMM! 🎉 You've added a new secret to your project!

### Issues with Doppler on `npm start`

1. **Download the secrets**
```bash
doppler secrets download --no-file --format env > .env
```

2. **Run the app**

```bash
npm start:without-doppler
```

> This will run the app without Doppler, using the `.env` file instead. This is useful for debugging or if you encounter issues with Doppler but not recommended!

---

## 🔄 CI/CD Workflows

This project uses GitHub Actions for continuous integration:

### 🔍 Branch Name Check

We enforce a specific branch naming convention: `username/ticket-description`

Examples of valid branch names:
- `bruadam/af-641-fix-package-module-peer-deps`
- `johndoe/cd-123-add-login-feature`

The GitHub Action will fail if your branch name doesn't follow this convention.

### 🎨 Prettier Code Formatting Check

All code must conform to our Prettier formatting standards defined in `.prettierrc`. This ensures consistent code style across the project.

The GitHub Action will:
- Check if your code is properly formatted
- Fail the workflow if formatting issues are found

To check and fix formatting locally:
```bash
# Check formatting without modifying files
npm format:check

# Automatically fix formatting issues
npm format
```

### 📱 EAS Preview

- **Purpose**: Creates preview builds for pull requests to facilitate review
- **Trigger**: Runs automatically when a pull request is opened or updated
- **Requirements**:
  - Requires an `EXPO_TOKEN` secret configured in the repository settings
  - Uses Yarn for dependency management

- **What it does**:
  - Sets up Node.js and the Expo Application Services (EAS) CLI
  - Installs dependencies using Yarn
  - Creates a preview build using `eas update --auto`
  - Automatically adds a comment to the PR with links to preview the changes

- **Benefits**:
  - Reviewers can test changes without setting up a local environment
  - Provides a way to verify UI/UX changes across devices
  - Facilitates easier and more thorough code reviews

- **Troubleshooting**:
  If the workflow fails with an error about the EXPO_TOKEN:
  1. Make sure the secret is correctly set in your repository settings
  2. Verify that the token is associated with the Expo account linked to this project

### 👨‍💻 How to View Results

1. Push your changes to GitHub
2. Go to your repository on GitHub
3. Navigate to the "Actions" tab
4. See the results of the workflow runs

---
## Building the App

### Before Building

- 1. Make sure all dependencies are installed and up-to-date.
```bash
npx expo install --check
```

### Buidling for iOS
```bash
eas build --platform ios --profile production
```

### Buidling for Android
```bash
eas build --platform android --profile production
```

### Submitting to App Store and Play Store
```bash
eas submit --platform ios
eas submit --platform android
```

---

## 🧼 Clean Install & Troubleshooting

If you're facing issues or want to start fresh, follow these steps for a clean installation.

### 🧹 Cleanup Steps

#### For **Unix/Linux/macOS**:
```bash
rm -rf node_modules .expo dist package-lock.json
```

#### For **Windows (PowerShell)**:
```powershell
Remove-Item -Recurse -Force node_modules, .expo, dist, package-lock.json
```

### 🔄 Reinstall Dependencies

```bash
npm install
```

If you run into peer dependency errors:
```bash
npm install --legacy-peer-deps
```

### 🕵️ Check for Missing Dependencies

```bash
npx depcheck
```

### ▶️ Start the App

```bash
npm start
```

---

## 📝 Notes

- Use `npm run lint` to check code style.
- Press `s` in the Expo terminal to toggle between development build and Expo Go.
- Keep your dependencies clean and up-to-date for smoother development.

## Name Conventions

### Code
- Use `camelCase` for variables and functions.
- Use `PascalCase` for components and classes.
- Use `UPPER_SNAKE_CASE` for constants and environment variables.
- Use `kebab-case` for folder names.

File names should be the same as what's inside the file.

1. For example, if you have a file called `MyComponent.tsx`, the component inside should be named `MyComponent`.
2. And if you have a file called `myFunction.tsx`, the function inside should be named `myFunction`.
3. And if you have a file called `MY_CONSTANT.ts`, the constant inside should be named `MY_CONSTANT`.

### Git Branches and Commits
- Use `lowercase` for branch names.
- Use `lowercase` for commit messages.
- Use `lowercase` for pull request titles.
- Use `lowercase` for pull request descriptions.
- Use `lowercase` for issue titles.
- Use `lowercase` for issue descriptions.
- Use `lowercase` for labels.

## 🧑‍🤝‍🧑 Team

- [Oleg Moshkovich](https://github.com/OlegMoshkovich)
- [Bruno Adam](https://github.com/bruadam)