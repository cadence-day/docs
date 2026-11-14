---
sidebar_position: 5
---

# Encryption & Security

## Is my data encrypted?

Partly, and precisely:

- **Activity names** and **note text** are **end-to-end encrypted**: encrypted on your device, readable only on your linked devices. We can't read them.
- **Everything else is not end-to-end encrypted**: the times of the hours you log, which activity each hour belongs to, activity colors and icons, module and moment entries (such as mood, or a film title and rating), and your account details.

All traffic to Cadence uses TLS, and our database provider encrypts stored data at rest.

## Which encryption does Cadence use?

AES-256-GCM for the text, with each piece of text's key wrapped for each of your devices using X25519. Older formats from earlier versions are still read and upgraded. More in [Privacy & Security](/docs/features/privacy-security#how-the-encryption-works).

## Where are my keys?

In your iPhone's Keychain. Each device has its own. Your devices publish only their public keys to Cadence. You can see them in **Settings → Privacy → Encryption**.

## How do I use my data on a new device?

Link it:

1. Sign in on the new device. It shows **Link this device** and a QR code.
2. On a device that has your data: **Settings → Encryption → Link new device**, and scan the code.
3. Check that both devices show the same code, then tap **Confirm & link**.

## Why do I see "Unable to decrypt"?

The device you're on doesn't have the key that text was encrypted with, usually because it hasn't been linked to your other device yet. Link it (above). Cadence never overwrites the encrypted text in that state, so linking makes it readable again.

## What happens if I lose all my devices?

Your encryption keys live only on your devices. If every device that has them is gone, we can't recover your activity names and note text. Everything that isn't end-to-end encrypted is still in your account if Cloud sync was on.

## Can Cadence employees see my data?

Not your activity names or note text. Data that isn't end-to-end encrypted and that you synced to your account is protected by access controls but is technically readable on our servers. Data you never synced isn't on our servers at all.

## Is Location or Health data encrypted?

It never leaves your iPhone, so it isn't uploaded in any form. On the device it's protected by iOS. See [Location & Health](/docs/faq/location-health).

## Is my data shared with third parties?

We don't sell or share your data for advertising. We use a few service providers to run Cadence (sign-in, database, analytics, diagnostics), listed in the [Privacy Policy](/docs/legal/privacy#service-providers).

## How do I report a security issue?

Email [admin@cadence.day](mailto:admin@cadence.day) with a description and steps to reproduce. Please don't post it publicly.
