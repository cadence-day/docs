---
sidebar_position: 5
---

# Encryption & Security

Your privacy and security are our top priorities. Learn how Cadence protects your data.

## How is my data encrypted?

Cadence uses **end-to-end encryption** for your most sensitive data:

**What's encrypted:**

- Notes and reflections
- Personal insights and patterns

**Encryption method:**

- **AES-256-GCM**: Industry-standard encryption algorithm
- **Unique keys**: Each user has their own encryption key
- **Encrypted at rest**: Data is encrypted before leaving your device
- **Encrypted in transit**: All network communications use HTTPS/TLS

Your encryption key is derived from your authentication credentials and never leaves your device in plain text.

## What data is NOT encrypted?

To provide core functionality, some data is stored in a structured (non-encrypted) format:

- **Activity logs**: Time, duration, and activity type
- **Activity metadata**: Colors, emojis, custom names
- **User profile**: Email, username, preferences

This allows us to provide fast timeline views, pattern analysis, and sync across devices.

## Where is my data stored?

**Database**: Supabase (PostgreSQL) hosted on secure cloud infrastructure

- Data centers with SOC 2 Type II compliance
- Regular backups and disaster recovery
- Network isolation and access controls

**Local storage**: Some data is cached on your device for offline access:

- Activity logs for the current week
- User preferences
- Encryption keys (stored in iOS Keychain)

## Can I export my data?

Yes! You can export all your Cadence data at any time:

1. Go to **Profile** → **Settings** → **Data & Privacy**
2. Tap **"Export My Data"**
3. Choose format: JSON or CSV
4. Your data will be prepared and sent to your email

Exported data includes:

- All activities and time logs
- Notes and reflections (decrypted)
- Custom activities and preferences

## Can Cadence employees see my data?

**Encrypted data**: No! Your notes, reflections are encrypted end-to-end. Even our employees cannot decrypt this information.

**Activity data**: We can see anonymized activity patterns for debugging and improving the app, but we never access or share personally identifiable information.

## Is my data shared with third parties?

**No**, we never share your personal data with third parties for marketing or advertising purposes.

**Service providers we use:**

- **Supabase**: Database and authentication (with strict data processing agreements)
- **Sentry**: Error tracking (anonymized error logs only)

All third-party services are bound by strict data processing agreements and only receive the minimum data necessary to provide their services.

## What happens if I delete my account?

When you delete your account:

1. **Immediate actions:**
   - Your account is deactivated
   - You're logged out of all devices
   - Your encryption key is deleted (making encrypted data unrecoverable)

2. **Within 30 days:**
   - All personal data is permanently deleted from our servers
   - Backups are purged
   - No recovery is possible after this point

3. **What remains:**
   - Anonymized usage statistics (no personal identifiers)
   - Legal/compliance records (if required by law)

## How do I enable/disable encryption?

**Encryption is always enabled** for sensitive data (notes, reflections). You cannot disable it.

For optional features:

- **Biometric unlock**: Settings → Security → Face ID/Touch ID
- **Auto-lock**: Settings → Security → Auto-lock (require authentication after inactivity)

## What if I forget my password?

**Important**: Because of end-to-end encryption, if you forget your password:

- You can reset your password using email verification
- **However**, your encrypted data (notes, reflections) will be permanently lost
- Activity logs and profile data will remain accessible

**Best practices:**

- Use a strong, memorable password
- Consider using a password manager
- Keep your email address up to date for recovery

## Is Cadence GDPR compliant?

Yes! Cadence is fully compliant with GDPR (General Data Protection Regulation):

- **Right to access**: Export your data anytime
- **Right to erasure**: Delete your account and all data
- **Right to portability**: Export data in machine-readable formats
- **Right to rectification**: Edit or correct your data
- **Data minimization**: We only collect what's necessary
- **Consent**: Clear opt-ins for data collection

For GDPR inquiries, contact: [admin@cadence.day](mailto:admin@cadence.day)

## How do I report a security issue?

If you discover a security vulnerability:

1. **Do not** post it publicly
2. Email us immediately at: [admin@cadence.day](mailto:admin@cadence.day)
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Your contact information

We take security seriously and will respond within 24 hours. We appreciate responsible disclosure and may offer recognition or rewards for valid findings.

## Can I use Cadence for HIPAA-compliant data?

**No**, Cadence is not currently HIPAA-compliant and should not be used to store protected health information (PHI).

While we use strong encryption, HIPAA compliance requires additional:

- Business Associate Agreements (BAAs)
- Specific audit logging
- Physical safeguards
- Employee training certifications

If you need HIPAA compliance, please contact us at: [admin@cadence.day](mailto:admin@cadence.day) to discuss potential enterprise solutions.

## What encryption libraries does Cadence use?

We use industry-standard, battle-tested encryption libraries:

- **iOS**: CommonCrypto (Apple's native cryptography framework)
- **JavaScript**: Web Crypto API and crypto-js
- **Backend**: PostgreSQL pgcrypto extension

All libraries are regularly updated to patch vulnerabilities.

## Does Cadence have a bug bounty program?

Not yet, but we're planning to launch one! In the meantime:

- Report vulnerabilities to: [admin@cadence.day](mailto:admin@cadence.day)
- We may offer rewards on a case-by-case basis
- You'll be credited in our security acknowledgments (with permission)

## How often are security audits performed?

- **Code reviews**: Every pull request is reviewed by senior developers
- **Dependency updates**: Weekly automated security scans
- **Penetration testing**: Planned annually (starting 2025)
- **Third-party audit**: Planned for when we reach 100K+ users

## Can I see Cadence's security certifications?

We're working toward:

- SOC 2 Type II certification (2025)
- ISO 27001 certification (2026)

Current security measures:

- ✅ End-to-end encryption (AES-256-GCM)
- ✅ HTTPS/TLS for all network traffic
- ✅ Regular security updates
- ✅ Minimal data collection
- ✅ GDPR compliance

## More Questions?

If you have additional security or privacy questions:

- Email: [admin@cadence.day](mailto:admin@cadence.day)
- View our [Privacy Policy](/docs/legal/privacy)
- View our [Terms of Service](/docs/legal/terms)

---

_Last updated: January 2025_
