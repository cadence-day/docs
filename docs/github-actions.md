# CI/CD Pipeline for React Native (Expo) App

This repository contains a fully automated CI/CD pipeline for our Expo/React Native app using GitHub Actions, Expo EAS, and App Store Connect API.

---

## Branch Behaviours

| Branch / Event                     | Action                                                                                                                                                                                                                                    |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Push to `dev`**                  | Publishes an EAS Update to the `development` profile for preview in Expo Go.                                                                                                                                                              |
| **PR opened/updated to `staging`** | Bumps build number, commits back, runs `eas update` (profile `preview`), runs a build (no submit).                                                                                                                                        |
| **PR merged into `staging`**       | Bumps build number, builds iOS (production profile), submits to App Store Connect, adds build to `alpha-users`, fetches public TestFlight link, comments link on PR, posts to Discord.                                                    |
| **PR opened/updated to `main`**    | Bumps app version & build number (uses `[x.y.z]` in PR title if present), commits back, runs `eas update` (profile `production`).                                                                                                         |
| **PR merged into `main`**          | Bumps app version & build number again, builds iOS, submits to App Store Connect, adds to `alpha-users`, fetches TestFlight link, creates GitHub Release, creates issue to track Apple acceptance, comments link on PR, posts to Discord. |

---

## Folder Structure

```
scripts/
  bump_version.js                 # bumps version/build numbers in app.json
  asc_api_auth.sh                 # generates JWT for Apple API
  asc_api_beta_groups.sh          # ensures 'alpha-users' beta group exists
  asc_api_add_build_to_group.sh   # adds a build to the group
  asc_api_get_public_link.sh      # enables & fetches public TestFlight link

.github/workflows/
  dev-preview.yml                 # dev push → EAS update
  staging.yml                     # staging PRs (open & merged)
  release-main.yml                # main PRs (open & merged)

.github/ISSUE_TEMPLATES/
  appstore_acceptance.md          # template for tracking Apple review acceptance
```

_(If you downloaded a ZIP with `GitHub/` instead of `.github/`, rename `GitHub` back to `.github` before pushing to your repo.)_

---

## Required Secrets (GitHub → Settings → Secrets and variables → Actions)

| Secret                            | Example                                | Purpose                                 |
| --------------------------------- | -------------------------------------- | --------------------------------------- |
| `EXPO_TOKEN`                      | `eyJhbGciOi...`                        | Expo/EAS CLI token (`eas token:create`) |
| `APP_STORE_CONNECT_KEY`           | `-----BEGIN PRIVATE KEY----- ...`      | Full `.p8` API private key contents     |
| `APP_STORE_CONNECT_KEY_ID`        | `A1B2C3D4E5`                           | Apple Key ID                            |
| `APP_STORE_CONNECT_KEY_ISSUER_ID` | `11223344-...`                         | Apple Issuer ID                         |
| `APP_STORE_CONNECT_APP_ID`        | `1234567890`                           | App Store Connect App ID (numeric)      |
| `DISCORD_WEBHOOK`                 | `https://discord.com/api/webhooks/...` | Discord channel webhook URL             |

_(You can also add `APPLE_ID` / `APPLE_APP_SPECIFIC_PASSWORD` if you use username/password submission instead of API key.)_

---

## Version & Build Bumping Logic

- **Staging PRs**: increments `expo.ios.buildNumber` (and `expo.android.versionCode`), leaves `expo.version` unchanged.
- **Main PRs**: increments build number and updates `expo.version`. If the PR title contains `[x.y.z]` it sets the version to that string; otherwise it bumps the patch automatically.

---

## How to Use

1. Add the above secrets in your GitHub repo.
2. Commit the workflows and scripts to your repository (ensure `.github/` folder).
3. Make scripts executable: `chmod +x scripts/*.sh`.
4. Push a PR to `staging` or `main` and watch the Actions tab.
5. Check the PR comments and your Discord channel for build/TestFlight links.

---

## Maintainers Tips

- If you rotate the Apple API key, update all four Apple secrets.
- Press `⌘ + Shift + .` on macOS Finder to show the `.github` folder.
- `scripts/asc_api_auth.sh` creates short-lived JWTs; never store them in secrets.

---
