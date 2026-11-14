# Cloud Sync & Devices

Where your data lives, what Cloud sync does, and how to use Cadence on more than one device.

## Where is my data stored?

On your iPhone. Cadence keeps your activities, time slices, notes and trackers in a database on the device, so the app works without a connection and nothing has to be uploaded.

Copying that data to your Cadence account is optional. That is what **Cloud sync** does.

## What is Cloud sync?

**Cloud sync** copies your activities, notes, trackers and time slices to your Cadence account and keeps them up to date. You find it in **Settings → General → Cloud sync**.

![Settings, General: the Cloud sync section with the "Sync to the cloud" toggle](/img/app/settings-general-cloud-sync.webp)

It is **off by default**.

## What happens when Cloud sync is off?

This is "local mode":

- Your activities, notes, trackers and time slices **stay on your iPhone**. They are not uploaded.
- Your **account, sign-in and encryption keys still use Cadence servers**. You still need an account and a connection to sign in.
- Some insights that are computed on the server need Cloud sync to be on.
- If you lose your iPhone, data that exists only on it can't be restored by us. Your iPhone's own backup (for example iCloud Backup) still includes it.

## What happens when I turn Cloud sync on?

1. Cadence asks you to confirm.
2. Everything you recorded while sync was off is **uploaded** to your account.
3. Your account's existing history is **copied onto your iPhone**.
4. A **Syncing your data** screen shows the progress, step by step. You can tap **Continue in background** and keep using the app.

After that, new changes upload in the background. Nothing is deleted, and encrypted text (activity names and notes) stays encrypted exactly as before.

If you are offline, syncing waits and continues by itself when you're back online. If something fails, your data stays safe on your iPhone and Settings shows how many items are still waiting, with a **Sync again** button.

## What happens when I turn Cloud sync off again?

Syncing stops. **Nothing is deleted**: your iPhone keeps everything, and what was already uploaded stays in your account. New changes stay on your iPhone until you turn sync back on.

## Why did Cloud sync turn itself on?

Because you signed in to the **Cadence web app** with the same account. The web app only shows what is in your Cadence account, so Cadence turns Cloud sync on and tells you with a "Cloud sync is now on" message.

You can turn it off again in **Settings → General**. The web app then stops showing new data from your iPhone.

## Can I use Cadence on several devices?

Yes, with Cloud sync on and the same account on each device. Two things to know:

- **Link each new device first.** Activity names and notes are encrypted with keys that live on your devices. A new device can only read them after you link it to a device that already has the keys, by scanning a QR code. See [Encryption & Security](/docs/faq/encryption).
- **Multi-device sync is still being finished.** Don't rely on it to keep several devices perfectly in step yet. If you edit the same hour or note on two devices, one of the changes may not show up on the other.

Location and Health history never sync. They stay on the iPhone that recorded them. To move them to a new iPhone, use **Settings → Extensions → Export data** and **Import data**.

## Does Cadence work offline?

Yes. Everything you log is saved on your iPhone first. With Cloud sync on, changes upload when you're back online.

## How do I delete my data?

- **One entry**: delete it in the app.
- **Location or Health history**: **Settings → Extensions → Delete location history** or **Delete health history**.
- **Your account**: **Settings → Account → Delete account**. Your sign-in is removed immediately, and the data in your Cadence account is permanently deleted 7 days later. This can't be undone.
- **Data on your iPhone**: delete the app. Account deletion doesn't erase the copy on the device.

Details are in the [Privacy Policy](/docs/legal/privacy).
