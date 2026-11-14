<div class="legal-bg">

# Privacy Policy for Cadence Visual Time Tracking App

_Effective Date: 14.11.2026_

_Last updated: 14.11.2026_

Cadence ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy describes what information the Cadence app (the "App", distributed via the Apple App Store) and the Cadence web app collect, where it is stored, who processes it, and the choices you have. We take a conservative approach: we collect only what the App needs to work and to be improved.

## Summary

- Your time slices, activities, notes and trackers are stored **on your iPhone**. Copying them to your Cadence account ("Cloud sync") is **off by default** and you can turn it on or off at any time.
- Your sign-in, account and encryption keys always use our servers, even when Cloud sync is off.
- **Activity names and note text are encrypted on your device** before they are saved or uploaded. Other data, such as the times you log, is not end-to-end encrypted.
- **Location and Apple Health data are optional, stay on your iPhone, and are never uploaded** to us.
- We use a small number of service providers (listed below). We do not sell your data, use it for advertising, or track you across other apps and websites.

## Where your data is stored

### On your iPhone

The App keeps your data in a database on your iPhone. This includes your activities, time slices (the hours you log), notes, trackers and tracker entries, and, if you turn them on, your location history and Health readings. Like other app data on your iPhone, it is included in your iPhone's own backups (for example iCloud Backup, if you use it), which Apple manages under your Apple account.

### In your Cadence account (Cloud sync)

**Cloud sync** (Settings > General) decides whether your activities, time slices, notes, trackers and tracker entries are also copied to your Cadence account on our servers.

- **Off (the default, "local mode").** That data stays on your iPhone. It is not uploaded. Your account, sign-in and encryption keys still use our servers (see below). Some insights that are computed on our servers need Cloud sync to be on.
- **Turning it on.** Before anything is uploaded, the App asks you to confirm. It then uploads everything you recorded while sync was off and copies your account's existing history onto your iPhone. A "Syncing your data" screen shows the progress. Afterwards, new changes are uploaded in the background.
- **Turning it off again.** Syncing stops. Nothing is deleted, either on your iPhone or in your account: what was already uploaded stays in your account until you delete it or delete your account.
- **Using the web app.** The Cadence web app only shows data that is in your Cadence account. If you sign in to the web app with the same account, the App turns Cloud sync on and tells you so. You can turn it off again in Settings > General; the web app then stops receiving new data from your iPhone.
- **Several devices.** Cloud sync is still being completed. Do not rely on it to keep several devices perfectly in step yet; if you edit the same data on two devices, one change may not appear on the other.

### Data that always goes to our servers

Even in local mode, the App uses our servers for:

- signing in and managing your account (through Clerk, see below);
- your encryption **public keys**, which other devices you link need in order to read your encrypted data (private keys never leave your devices);
- linking a new device to your encryption keys (we cannot read the keys);
- account deletion requests.

## Information we collect

### Account information

When you create an account, our authentication provider Clerk processes your email address, your name (if you provide one or it comes from Sign in with Apple or Google), your profile photo (if you add one), and the identifier of the Apple or Google account you sign in with. You can sign in with Apple, Google, or your email address and a password; a code is sent to your email to verify it. We also store small account settings with Clerk, such as whether you finished onboarding, the App version you last used, and whether you use the web app.

### Your time-tracking content

- **Activities**: name, color and order. **Activity names are encrypted on your device.**
- **Time slices**: the start and end time of each logged hour and which activity it belongs to. These are **not** end-to-end encrypted.
- **Notes**: **note text is encrypted on your device.** The time a note belongs to is not.
- **Trackers and tracker entries**, including modules (for example mood or energy) and moments (for example a film title, rating and what you wrote about it): **not** end-to-end encrypted.

This content stays on your iPhone unless Cloud sync is on (or you use the web app, which reads it from your account).

### Location (optional)

Location is an optional extension that is off until you turn it on in **Settings > Extensions**. It records where each hour of your day happened so the App can show it on a map.

- The App first asks for location access **While Using the App**. It can then ask you to upgrade to **Always**, so it can keep recording in the background and fill in the hours when you are not using the App. You can decline: recording then happens only while the App is open.
- The App records a coarse location (not navigation-grade precision), grouped into places you stayed and journeys between them.
- It may also ask for **Motion & Fitness** access, to tell a journey from time spent in one place so it records less location. Declining is fine.
- **Location history is stored only on your iPhone. It is never uploaded to our servers**, and it is not part of Cloud sync.
- The map itself is drawn with Apple Maps.
- Turning the toggle off stops recording but keeps the history. **Settings > Extensions > Delete location history** deletes it.

### Apple Health (optional)

Health is an optional extension that is off until you turn it on in **Settings > Extensions**.

- The App **reads** your **heart rate** and **step count** from Apple Health and stores them as hourly values, so each hour of your day shows what your body was doing. It reads nothing else.
- **It never writes anything to Apple Health.** iOS requires the App to include a description for writing to Health because the App holds the HealthKit entitlement, but the App does not use it.
- **Health data is stored only on your iPhone. It is never uploaded to our servers**, and it is not part of Cloud sync.
- Health data is **not used for advertising or marketing, not sold, and not shared** with anyone.
- **Settings > Extensions > Delete health history** deletes it. You can also withdraw access at any time in the Health app (Sharing > Apps > Cadence).

### Camera and photos

- **Camera**: to scan the QR code when you link a new device to your encryption keys, and to take a profile photo if you choose to.
- **Photo library**: to choose a profile photo, and to save a profile photo you took.

The App does not access your contacts or microphone, and it does not record audio.

### Product analytics (PostHog)

To understand how the App is used and improve it, the iPhone App can send usage events to PostHog: for example that the App was opened or moved to the background, and which screens were viewed, together with device and app information (device model, operating system and version, app version, language, and a random identifier created by PostHog on your device). The App does not send your name, email, Cadence account identifier, activity names, notes or any content you record, and it does not record your screen. These analytics are only active when the App build includes our PostHog configuration, and are not used in the web app.

### Encryption diagnostics (Sentry)

If encrypting or decrypting your data fails, or the App has to ask you to link a device, the App can send a diagnostic report to Sentry so we can fix the problem. These reports contain technical details such as the error type and message, which step failed, and lengths and identifiers of the affected records. They **never** contain your encryption keys, encrypted data or the text of your activities and notes. No other crashes or errors are sent to Sentry, and crash reporting at the operating-system level is turned off.

### App performance (Expo)

The App sends performance measurements to Expo, the platform it is built on: for example how long the App takes to start and to show a screen, with the screen name, device model, operating system and app version. These measurements do not contain your content.

## How we use your information

We use your information to:

- provide the App and your account, including sign-in, Cloud sync, the web app and device linking;
- show your activities, time, notes, trackers, insights and, if you turn them on, your map and Health readings;
- find and fix problems, and improve the App.

We do not sell, rent or share your personal data for advertising or marketing, and we do not track you across other companies' apps or websites. We may disclose data only when legally required (for example, to comply with a valid court order).

## Service providers

We rely on the following providers to run Cadence. Each processes data only to provide its service to us, under its own privacy policy:

- **Clerk**: sign-in and account management (email, name, profile photo, Apple or Google account identifier, account settings). [Clerk Privacy Policy](https://clerk.com/privacy)
- **Supabase**: our database and server functions (your account's synced data when Cloud sync is on, encryption public keys, account deletion). [Supabase Privacy Policy](https://supabase.com/privacy)
- **PostHog**: product analytics, as described above. [PostHog Privacy Policy](https://posthog.com/privacy)
- **Sentry**: encryption diagnostics, as described above. [Sentry Privacy Policy](https://sentry.io/privacy/)
- **Expo**: app updates and performance measurements, as described above. [Expo Privacy Policy](https://expo.dev/privacy)
- **Apple**: the App Store, Sign in with Apple, Apple Health, Apple Maps and iCloud Backup, under your agreement with Apple.
- **Google**: Sign in with Google, if you use it.

Some of these providers process data outside the European Union, including in the United States.

## Data security

- All traffic between the App and our servers is encrypted in transit with TLS.
- Our database provider encrypts stored data at rest.
- **Activity names and note text are end-to-end encrypted**: they are encrypted on your device before they are saved or uploaded, and only your devices hold the private keys needed to read them. We cannot read them.
- **Other data is not end-to-end encrypted**: this includes the times of your time slices, activity colors, tracker entries, your account details, and any other data not listed above as encrypted. On our servers, it is protected by access controls and the encryption at rest described above.
- Your private encryption keys are stored in your iPhone's secure storage (the Keychain). To use your data on another device, you link it: the new device shows a QR code, and a device that already has your keys scans it. Keys are never sent to us in a form we can read.

## Your rights and choices

You can:

- **See and correct** your data in the App at any time.
- **Keep your data on your iPhone** by leaving Cloud sync off, or stop syncing at any time.
- **Turn off Location or Health** in Settings > Extensions, and withdraw permission in iOS Settings or the Health app.
- **Delete** individual entries, your location history or your health history in the App.
- **Export** your data:
  - **Settings > General > Export all data** downloads the data stored in your Cadence account as a JSON file (encrypted fields stay encrypted). In local mode, this file contains only what is in your account, not what is only on your iPhone.
  - **Settings > Extensions > Export data** saves your location and Health history to a file protected with a passphrase you choose, which you can import on another iPhone.
- **Delete your account** (see below).
- **Ask us** to access, correct, export or delete your data, or to restrict or object to its use. You also have the right to lodge a complaint with a data protection authority.

To exercise any of these rights, contact us at: [admin@cadence.day](mailto:admin@cadence.day) or [dev@cadence.day](mailto:dev@cadence.day).

Office Address: 2 Danziger Str, Berlin 10435, Germany

## Account deletion

You can delete your account in the App: **Settings > Account > Delete account**. When you confirm:

1. Your sign-in account is deleted from our servers and from Clerk **immediately**, so you can no longer sign in.
2. The data stored in your Cadence account is **scheduled for permanent deletion 7 days later**.
3. The App signs you out.

Account deletion cannot be undone from the App. Data stored only on your iPhone (including location and Health history) is not on our servers; to remove it from your iPhone, delete the App. Copies in your own iPhone backups are managed by Apple under your Apple account.

## Data retention

- **Data on your iPhone** stays there until you delete it, delete the App, or erase the device.
- **Data in your Cadence account** is kept while your account exists, and is deleted as described under Account deletion.
- **Analytics, diagnostics and performance data** are kept by PostHog, Sentry and Expo for the retention period set for our account with each provider, and then deleted.
- We may keep information longer where the law requires it.

## Children's Privacy

The App is not intended for children under 16. We do not knowingly collect or store personal information from children.

## Jurisdiction

This Privacy Policy is governed by the laws of Germany. All disputes shall be subject to the exclusive jurisdiction of the courts in Berlin, Germany.

## Changes to This Policy

We update this policy when the App changes how it handles data. The "Last updated" date at the top shows when it last changed. When a change is significant (for example, a new kind of data or a new service provider), we will tell you in the App or by email before it takes effect. Earlier versions are available on request at [admin@cadence.day](mailto:admin@cadence.day).

**What changed on 14.11.2026:** this version describes local storage and Cloud sync, Location and Apple Health, camera and photo access, PostHog, Sentry and Expo, which data is end-to-end encrypted, and account deletion; and removes RevenueCat, which the App does not use.

</div>
