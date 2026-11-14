# Privacy & Security

How Cadence stores and protects your data, in plain words. The [Privacy Policy](/docs/legal/privacy) is the full, binding version.

## Your data lives on your iPhone

Cadence is local-first. Your activities, hours, notes and trackers are saved in a database on your iPhone. Copying them to your Cadence account is optional: that's **Cloud sync** (Settings → General), and it's **off by default**.

Even with Cloud sync off, your account, sign-in and encryption keys use Cadence servers. See [Cloud Sync & Devices](/docs/faq/sync-and-devices).

## What is encrypted

**End-to-end encrypted** (encrypted on your device, readable only on your devices):

- activity names;
- note text.

**Not end-to-end encrypted**:

- the times of the hours you log, and which activity each belongs to;
- activity colors and icons;
- module and moment entries (for example mood, or a film title and rating);
- your account details (name, email, profile photo).

When Cloud sync is on, this data is sent over an encrypted connection (TLS) and stored by our database provider, which encrypts it at rest. Only the end-to-end encrypted fields are unreadable to us.

### How the encryption works

- Each device has its own keys, kept in the iPhone's Keychain.
- Text is encrypted with **AES-256-GCM**. The key for each piece of text is wrapped for each of your devices with **X25519** key agreement, so every linked device can read it.
- Your devices publish only their **public** keys to Cadence. Private keys are never sent to us in a form we can read.
- Older formats from earlier versions of the app are still read, and upgraded when possible.

You can see your keys, this device's fingerprint and how it works in **Settings → Privacy → Encryption**.

<!-- screenshot: NN-settings-encryption -->

### Linking a new device

A new device can't read your encrypted names and notes until you link it:

1. On the new device, sign in. Cadence shows **Link this device** with a QR code.
2. On a device that already has your data, go to **Settings → Encryption → Link new device** and scan the code.
3. Check that the code shown on both devices matches, then tap **Confirm & link**.

<!-- screenshot: NN-encryption-link -->

If you skip linking (**Continue without linking**), encrypted names and notes from your other devices may show as "Unable to decrypt" on the new device until you link it.

## Location and Health

Both are optional, **stay on your iPhone, and are never uploaded**. Cadence reads heart rate and steps from Apple Health and never writes to it. See [Location & Apple Health](/docs/features/extensions).

## Analytics and diagnostics

- **PostHog** receives anonymous usage events from the iPhone app (for example app opened, screen viewed) with device and app version information. It never receives your content, name or email.
- **Sentry** receives a report only when encryption or decryption fails, without keys, encrypted data or your text.
- **Expo** receives app performance measurements, such as start-up time.

We don't sell your data, show ads, or track you across other apps.

## Your controls

- **Cloud sync**: on or off, any time (Settings → General).
- **Location and Health**: turn off or delete their history (Settings → Extensions).
- **Export**: **Export all data** (Settings → General) downloads what's in your Cadence account as JSON. **Export data** (Settings → Extensions) saves your location and Health history to a passphrase-protected file.
- **Delete your account**: Settings → Account → **Delete account**. Your sign-in is removed immediately and the data in your Cadence account is permanently deleted 7 days later. This can't be undone. Data on your iPhone is removed when you delete the app.

## Reporting a security issue

Found a vulnerability? Please email [admin@cadence.day](mailto:admin@cadence.day) rather than posting it publicly, with a description and steps to reproduce.
