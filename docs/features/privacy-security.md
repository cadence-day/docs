# Privacy & Security

How Cadence protects your personal data and maintains your privacy.

## Our Privacy Commitment

Your data is yours. Period.

At Cadence, we believe:

- **You own your data**: It's your life, your information
- **Privacy by design**: Security built into every feature
- **Transparency**: Clear communication about what we collect and why
- **Minimal data**: We only collect what's necessary
- **No selling**: We will never sell your personal data

## What We Collect

### Activity Data

**What we collect:**
- Activity names (e.g., "Work", "Exercise")
- Categories and colors
- Time stamps (when activities occurred)
- Duration of activities

**Why we collect it:**
- Enable core tracking functionality
- Display your timeline and patterns
- Sync across your devices

**How it's protected:**
- Stored securely in Supabase
- Transmitted over encrypted connections (HTTPS)
- Access controlled per-user (you only see your data)

### Notes and Reflections

**What we collect:**
- Text notes attached to activities
- Longer reflections

**Why we collect it:**
- Provide rich context for your history
- Build your personal journal

**How it's protected:**
- **End-to-end encrypted with AES-256**
- Encryption keys stored only on your device
- Even Cadence employees cannot read your notes
- Securely backed up in encrypted form

### Account Information

**What we collect:**
- Email address
- Account creation date
- Subscription status (if Premium)

**Why we collect it:**
- Enable sign-in and account recovery
- Process subscription payments (via Apple)
- Send important account notifications

**How it's protected:**
- Stored securely in Supabase
- Passwords hashed with industry-standard algorithms
- Never shared with third parties

### Usage Analytics

**What we collect (anonymously):**
- App crashes and errors
- Feature usage (which screens, which features)
- Performance metrics

**Why we collect it:**
- Fix bugs and crashes
- Understand which features are valuable
- Improve app performance

**How it's protected:**
- **Fully anonymized** - not linked to your identity
- Processed through Sentry for error tracking
- Used only for improvement, never sold

## What We DON'T Collect

We explicitly **do not** collect:

- ❌ **Location data** (we don't track where you are)
- ❌ **Contacts** (we don't access your address book)
- ❌ **Photos or media** (only the logo you choose for the app)
- ❌ **Other app usage** (we only see Cadence activity)
- ❌ **Browsing history** (we don't track your web activity)
- ❌ **Device identifiers** (beyond what's needed for push notifications)
- ❌ **Biometric data** (face, fingerprint, health data from other apps)

## Encryption Deep Dive

### AES-256 Encryption

We use **AES-256-GCM** (Advanced Encryption Standard, 256-bit, Galois/Counter Mode):

- **Military-grade**: Same encryption used by governments and banks
- **256-bit keys**: Maximum security for symmetric encryption
- **GCM mode**: Provides encryption + authentication (detects tampering)
- **Industry standard**: Trusted by security experts worldwide

### How It Works

1. **Key generation**: A unique 256-bit key is generated on your device
2. **Secure storage**: Key stored in iOS Keychain (hardware-protected)
3. **Encryption**: Notes encrypted on your device before sending
4. **Transmission**: Encrypted data sent over HTTPS
5. **Storage**: Encrypted data stored in Supabase
6. **Decryption**: Only your device can decrypt (it has the key!)

### End-to-End Encryption

"End-to-end" means:

- Data is encrypted **on your device**
- Stays encrypted **in transit** (over the internet)
- Stays encrypted **at rest** (in the database)
- Only decrypted **on your device** when you view it

Even if someone intercepts the data or accesses our servers, they only see encrypted gibberish!

## Third-Party Services

We use trusted partners for specific functions:

### Supabase (Database & Authentication)

- **Purpose**: Store your data, manage authentication
- **Location**: EU/US data centers (you can choose region)
- **Security**: SOC 2 certified, GDPR compliant
- **Access**: Cadence engineers can access encrypted data (but can't decrypt notes)

### Apple (Payment Processing)

- **Purpose**: Handle subscription payments (Premium)
- **What we send**: Nothing! Apple handles billing directly
- **What we receive**: Subscription status (active/inactive)
- **Security**: Apple's industry-leading payment security

### Sentry (Error Tracking)

- **Purpose**: Catch and fix bugs/crashes
- **What we send**: Error messages, stack traces, anonymized usage data
- **What's excluded**: Your notes, activities, personal data
- **Security**: Data anonymized and encrypted

## Your Rights & Controls

### Access Your Data

You can:

- **View all data**: In the app at any time
- **Export data**: Download all activities, notes, reflections (coming soon!)

### Delete Your Data

You can:

- **Delete notes**: Remove individual notes anytime
- **Delete account**: Permanently delete all data

To delete your account:

1. Profile > Settings > Account Management
2. Tap "Delete Account"
3. Confirm (this is permanent!)
4. All data is deleted within 30 days

### Control What We Collect

You can:

- **Disable analytics**: Opt out of anonymous usage tracking
- **Manage notifications**: Control what notifications you receive

## GDPR Compliance

As a company operating in Europe (Berlin & Copenhagen), we're committed to GDPR:

- **✅ Right to access**: Export your data anytime
- **✅ Right to deletion**: Delete your account and all data
- **✅ Right to portability**: Data export in standard format
- **✅ Right to rectification**: Edit/update your data anytime
- **✅ Data minimization**: We only collect what's needed
- **✅ Purpose limitation**: Data used only for stated purposes
- **✅ Storage limitation**: Data deleted when account is deleted
- **✅ Transparency**: Clear privacy policy and data practices

### For EU Users

- Data can be stored in EU regions (Supabase EU servers)
- GDPR data protection officer: privacy@cadence.day
- Right to file complaints with supervisory authorities

## Security Practices

### On Your Device

- **iOS Keychain**: Encryption keys stored in hardware-protected keychain
- **App sandboxing**: Cadence isolated from other apps
- **Secure coding**: Regular security audits and updates
- **Code signing**: App verified by Apple (no tampering)

### In Transit

- **HTTPS/TLS**: All network traffic encrypted
- **Certificate pinning**: Prevents man-in-the-middle attacks
- **Secure APIs**: Authentication required for all requests

### At Rest

- **Encrypted databases**: Supabase storage encrypted at rest
- **Access controls**: Strict role-based access for Cadence team
- **Regular backups**: Encrypted backups for disaster recovery
- **Logging and monitoring**: Detect and respond to suspicious activity

### In Development

- **Security reviews**: Code reviewed for vulnerabilities
- **Dependency scanning**: Monitor third-party libraries for issues
- **Penetration testing**: Regular security assessments
- **Incident response plan**: Prepared for security events

## Data Retention

### Active Accounts

- **Activities and notes**: Retained indefinitely while your account is active
- **Backups**: 30-day rolling backups (encrypted)

### Deleted Accounts

- **30-day grace period**: Data soft-deleted (recoverable if you change your mind)
- **After 30 days**: Permanent deletion from all systems including backups
- **Exception**: Anonymous usage analytics (already anonymous, may persist)

## Security Certifications (In Progress)

We're working toward:

- **SOC 2 Type II**: Third-party audit of security controls
- **ISO 27001**: International information security standard
- **HIPAA readiness**: For potential health/wellness use cases

Our infrastructure partners (Supabase, AWS) already maintain these certifications.

## Reporting Security Issues

Found a vulnerability? We appreciate responsible disclosure:

1. **Email**: security@cadence.day (not public GitHub, etc.)
2. **Encrypt (optional)**: Use our PGP key (available on request)
3. **Include**:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Your contact info (for follow-up)

**Our commitment:**
- **24-hour response**: We'll acknowledge your report within 24 hours
- **Regular updates**: We'll keep you informed as we address it
- **Credit**: We'll recognize you (if desired) when we fix it
- **No legal action**: We won't pursue legal action for good-faith research

## Transparency Reports (Future)

We're planning annual transparency reports to share:

- Number of data requests from law enforcement (if any)
- How we responded
- Security incidents (if any) and how we handled them
- Privacy improvements we've made

## Questions or Concerns?

We're here to help:

- **General questions**: admin@cadence.day
- **Privacy questions**: privacy@cadence.day
- **Security issues**: security@cadence.day

**Full legal documentation:**
- **Privacy Policy**: [https://cadence.day/privacy](https://cadence.day/privacy)
- **Terms of Service**: [https://cadence.day/terms](https://cadence.day/terms)

Your trust is our most important asset. We take privacy and security seriously because your life story deserves protection.
