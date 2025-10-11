# Encryption & Privacy

Learn how Cadence protects your personal data and maintains your privacy.

## How is my data encrypted?

Cadence uses **AES-256 encryption**, the same standard used by banks and government agencies:

- **End-to-end encryption**: Your notes and sensitive data are encrypted on your device before being sent to our servers
- **Encryption keys**: Your personal encryption key is generated on your device and never leaves it
- **Secure storage**: Encrypted data is stored in Supabase with additional security layers

Even we can't read your encrypted notes!

## What data is encrypted?

The following data is encrypted:

- **Notes**: All activity notes and reflections
- **Chat history**: Your conversations with Sage AI
- **Personal reflections**: Long-form reflections and insights
- **Sensitive metadata**: Certain metadata about your activities

Activity names, categories, and timing are stored securely but not encrypted to enable features like pattern analysis.

## Can I disable encryption?

No, encryption is mandatory to protect your privacy. All users benefit from the same level of security by default.

## What encryption algorithm does Cadence use?

Cadence uses **AES-256-GCM** (Advanced Encryption Standard with Galois/Counter Mode):

- **256-bit keys**: Maximum security for symmetric encryption
- **GCM mode**: Provides both encryption and authentication
- **Industry standard**: Trusted by security experts worldwide

## Where are my encryption keys stored?

Your encryption keys are:

- **Generated on your device** using secure random generation
- **Stored in secure device storage** (iOS Keychain)
- **Never transmitted** to our servers or third parties
- **Backed up securely** only to your personal iCloud Keychain (if enabled)

This ensures only you can decrypt your data.

## What happens if I lose my device?

**Good news:** Your data is safe!

1. **Encrypted data is backed up** in the cloud
2. **Your encryption key** is securely stored in iCloud Keychain
3. **Sign in on a new device** and your key will be restored automatically
4. **All your data remains accessible** and secure

Make sure iCloud Keychain is enabled on your device for automatic key backup.

## Can Cadence employees see my data?

**Encrypted data**: No! Your notes, reflections, and chat history are encrypted end-to-end. Even our employees cannot decrypt this information.

**Activity data**: We can see anonymized activity patterns for debugging and improving the app, but we never access or share personal identifiable information.

## Is my data shared with third parties?

**No/Users/brunoadam/Documents/work/current/projects/cadence-day/cadence-app/cadence-docs && cat > docs/faq/calendar.md << 'EOFCALENDAR'
# Calendar & Timeline

Learn how to navigate your activities across time in Cadence.

## How does the timeline view work?

The timeline is your main interface for tracking activities:

- **Time slots**: Each row represents a 30-minute period
- **Color-coded blocks**: Activities are shown as colored blocks
- **Scrollable view**: Scroll vertically through the day, horizontally between days
- **Tap to log**: Simply tap any time slot to log an activity

The timeline gives you a visual representation of how you spend your time.

## Can I change the time slot duration?

Currently, time slots are 30 minutes each. We're exploring options to customize this in future updates based on user feedback.

## How do I navigate between days?

There are several ways to navigate:

**Swipe:**
- Swipe left/right on the timeline to move between days

**Calendar picker:**
1. Tap the calendar icon in the header
2. Select any date
3. The timeline updates to show that day

**Today button:**
- Tap the "Today" button to jump back to the current day

## Can I view my week at a glance?

Yes! The **Reflection** screen shows your week in a compact cadence view:
- See all 7 days side-by-side
- Quickly identify patterns and rhythms
- Tap any day to see details

## Does Cadence integrate with my phone's calendar?

Not yet! Calendar integration is a planned feature that will allow you to:
- Import events from your phone's calendar
- See meetings and appointments alongside your activities
- Automatically suggest activities based on calendar events

This feature is coming soon based on user demand.

## Can I view multiple days side-by-side?

The Reflection screen shows your weekly cadence in a grid view. We're exploring additional multi-day views for deeper pattern analysis.

## How far back can I view my data?

You can view your activity history from the day you started using Cadence with no limits! All your data is preserved and accessible.

## Can I set recurring activities?

Recurring activities aren't directly supported yet, but you can:
- Quickly log the same activity for multiple days
- Use patterns from your Reflection view to spot regular activities

Automated recurring activities are on our roadmap!

## What's the difference between the Timeline and Reflection views?

**Timeline (Home screen):**
- Detailed view of a single day
- Log and edit activities in real-time
- See minute-by-minute breakdown

**Reflection:**
- Weekly overview with pattern insights
- Analyze your rhythms and balance
- Generate reflections with Sage AI
- See total time spent per activity

Use Timeline for daily logging, Reflection for understanding patterns.

## Can I zoom in/out on the timeline?

The timeline is optimized for 30-minute increments. We're considering zoom features for future updates to support different levels of detail.

## How do I see what I did last week?

1. Tap the calendar icon
2. Select a date from last week
3. Or swipe right multiple times to go back day-by-day

The Reflection screen also shows your full week at once!
EOFCALENDAR* We never sell or share your personal data with third parties. Here's what we do use:

**Analytics**: We use anonymous analytics to improve the app (no personal data)
**AI Processing**: Sage AI conversations are processed by OpenAI with strict privacy agreements
**Cloud Storage**: Encrypted data is stored in Supabase with enterprise-grade security

See our [Privacy Policy](https://cadence.day/privacy) for complete details.

## How does Sage AI protect my privacy?

When using Sage AI:

- **Conversations are encrypted** before being sent for processing
- **No personal identifiers** are included in AI requests
- **Data is not used for AI training** by our partners
- **Responses are encrypted** before storage
- **You can delete chat history** anytime

We have strict data processing agreements with our AI providers.

## Can I export my encrypted data?

Yes! You can export all your data including:

- Decrypted notes and reflections
- Activity history
- Chat conversations
- All metadata

Data export is currently in development and will be available soon.

## What security certifications does Cadence have?

We're working toward:

- **SOC 2 Type II** compliance
- **GDPR** compliance (we're based in Europe!)
- **HIPAA** readiness for healthcare use cases

Our infrastructure partners (Supabase, AWS) maintain industry-leading security certifications.

## How do I report a security issue?

If you discover a security vulnerability:

1. **Email us** at security@cadence.day
2. **Do not** post publicly until we've had time to address it
3. **We'll respond** within 24 hours
4. **We appreciate** responsible disclosure

We take all security reports seriously and will work quickly to address any issues.

## Is Cadence open source?

Not currently, but we're considering open-sourcing our encryption implementation for community security audits. Stay tuned!

## Does Cadence comply with GDPR?

Yes! As a company with operations in Berlin and Copenhagen, we're committed to GDPR compliance:

- **Data minimization**: We only collect what's necessary
- **Right to access**: Export all your data anytime
- **Right to deletion**: Delete your account and all data permanently
- **Transparent processing**: Clear privacy policy and data practices
- **EU-based infrastructure**: Data stored in EU regions when possible

Learn more in our [Privacy Policy](https://cadence.day/privacy).
