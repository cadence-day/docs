# 🔐 API Encryption Layer

Client-side encryption for sensitive user data in the Cadence app.

## 🎯 What's Encrypted

| Field | Location | Purpose |
|-------|----------|---------|
| `activities.name` | Activity titles | User privacy for activity names |
| `notes.message` | Note content | User privacy for personal notes |

## 🔧 How It Works

### Automatic Encryption/Decryption
- **Insert/Update**: Data is encrypted before storage
- **Get/Retrieve**: Data is decrypted before returning
- **Transparent**: No code changes needed - happens automatically in API calls

### Security Features
- **AES-256-CBC encryption** - Industry standard
- **Device-specific keys** - Stored securely using Expo SecureStore
- **Auto key generation** - Keys created on first use
- **Prefix-based identification** - Efficient checking of already encrypted data using `enc:` prefix
- **Error resilient** - Graceful fallback if encryption fails

## File Structure

```
shared/api/encryption/
├── core.ts           # Base encryption functions
├── resources/
│   ├── index.ts      # Exports all resource-specific functions
│   ├── activities.ts # Activity-specific encryption
│   └── notes.ts      # Note-specific encryption
└── index.ts          # Exports all functions
```

## Quick Usage Example

```typescript
// These calls automatically handle encryption/decryption
const activity = await getActivity(id);        // Returns decrypted name
const note = await insertNote(newNote);       // Encrypts message before storage
const updated = await updateActivity(data);   // Encrypts name before update
```

## Important Notes

- The encryption key is unique to each device and is stored securely using Expo SecureStore.
- If the encryption key is lost (e.g., user uninstalls the app), all previously encrypted data will be unrecoverable.
- Regularly rotating the encryption key is recommended for enhanced security using `rotateEncryptionKeyAndReEncryptData` in the `core` module.