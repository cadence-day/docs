---
sidebar_position: 2
title: Error handling, logs and Sentry
---

# Error handling, logs and Sentry, per user flow

For developers and support. For each step of the three flows that fail most
often (sign-up and onboarding, API calls, encryption) this page gives the exact
log string and level in the app, what reaches Sentry, and what to look for.

Every string and `file:line` below was read from `cadence-app` at `origin/dev`
commit `52583cb5133ef3e0b6ff866de0a62eddd473e5fb`. Line numbers drift: search
for the quoted string if a line no longer matches. Secrets and user data are
never quoted here.

## How an error travels

All app logging goes through `Logger` (`shared/utils/errorHandler.ts`).

| Call | Production console output | Development console | Line |
| --- | --- | --- | --- |
| `Logger.logError(error, context, extra)` | `[Error] <context>:` then the error, then `Extra context:` and the extra object | grouped `🚨 Error in <context>` | `errorHandler.ts:49` |
| `Logger.logWarning(message, context, extra)` | `[Warning] <context>:` then the message, then `Extra context:` | grouped `⚠️  Warning in <context>` | `errorHandler.ts:90` |
| `Logger.logDebug(message, context, data)` | nothing | grouped `🔍 Debug in <context>` | `errorHandler.ts:128` |

`logWarning` and `logDebug` are skipped when `logger-filters.json` sets that
context to `false` (`errorHandler.ts:95`, `:133`).

### What reaches Sentry

Sentry (`@sentry/react-native` `~8.28.0`) is initialised once at module load of
`app/_layout.tsx:70` through `shared/utils/sentry/sentryClient.ts`. It is live
only when all of these hold (`sentryConfig.ts:40`, `sentryClient.ts:82`):

- `EXPO_PUBLIC_SENTRY_DSN` is set,
- the build is native (the web bundle uses the no-op `sentryClient.web.ts`),
- it is not Jest,
- it is not `__DEV__`, unless `EXPO_PUBLIC_SENTRY_ENABLE_IN_DEV=true`.

The `environment` tag comes from the EAS update channel: `production` is
`production`, `preview` and `staging` are `staging`, anything else (a local dev
client) is `development` (`sentryConfig.ts:16`). `release` is
`<bundle id>@<version>+<build>` (`sentryConfig.ts:49`).

Only four things produce an event:

1. **A render error** caught by `ErrorBoundary`: `ErrorBoundary.tsx:34` logs
   `ErrorBoundary.componentDidCatch` and `:40` calls `captureRenderError`
   (`sentryClient.ts:152`). Tag `area=render`, extra `componentStack` (first
   2000 characters). The screen shows "App Error" / "An error occurred. Please
   close and re-open the app." (`ErrorBoundary.tsx:47-49`).
2. **A native crash.** `enableNativeCrashHandling: true` (`sentryClient.ts:108`).
3. **A `Logger.logError` or `Logger.logWarning` whose `context` contains
   `ENCRYPT`, `DECRYPT` or `CDV2`, in any case** (`encryptionSentry.ts:24`,
   called from `errorHandler.ts:75` and `:112`). Every other context stays on
   the device console. See [Gaps](#gaps).
4. **`reportEncryptionLinkPrompt`** (`encryptionSentry.ts:113`): a warning
   `Encryption link prompt: <reason> (<shown> via <source>)`.

Tags on a Logger-driven event (`encryptionSentry.ts:75-83`):

| Tag | Value |
| --- | --- |
| `area` | `encryption` |
| `context` | the Logger context, for example `DECRYPTION_FAILED` |
| `report` | `exception` when an error object was passed, else `message` |
| `reason` | only when `extra.reason` is a string; also sets the fingerprint `["encryption-link-prompt", reason]` |

A `report=message` event has its stack removed in `beforeSend`
(`sentryClient.ts:128`), so its title is the message text.

Scrubbing (`sentryScrub.ts`, applied in `beforeSend` and `beforeBreadcrumb`)
removes the following before anything leaves the device:

- Ciphertext (`enc:`, `cdv1:`, `cdv2:`), JWTs, emails, Clerk ids, UUIDs, long
  blobs and URL query strings, replaced by `[redacted-...]`. Messages are cut to
  300 characters (`sentryScrub.ts:10-40`).
- Extra and tag keys that match `note|name|title|content|text|body|description|email|phone|user|token|secret|cipher|plaintext|password|key|authorization|cookie|activity|location|lat|lng|address`,
  unless the key also matches `length|count|reason|source|shown|context|area`
  (`sentryScrub.ts:22-25`).
- Request bodies, headers, cookies, `server_name`, `device.name`, and every
  breadcrumb except `app.lifecycle`, `device.event`, `device.orientation`,
  `navigation` and `sentry.event`.
- `user` is dropped unless its id is a random installation UUID
  (`sentryScrub.ts:113`). The app never calls `Sentry.setUser`.

Init settings worth knowing (`sentryClient.ts:105-131`): `sendDefaultPii: false`,
`tracesSampleRate: 0`, `enableCaptureFailedRequests: false`,
`attachScreenshot: false`, `attachViewHierarchy: false`, `enableLogs: false`,
`maxBreadcrumbs: 30`, `attachStacktrace: false`.

To prove on a dev build that an event arrives, open
`cadence://dev-sentry-test?kind=exception|message|crash` (needs
`EXPO_PUBLIC_SENTRY_ENABLE_IN_DEV=true`; `useDevSentryLink.tsx`).

---

## Flow 1: sign-up, sign-in and onboarding

Cadence has no Supabase sign-up. Clerk creates the user. Every Supabase and
GraphQL request then carries the current Clerk session token
(`shared/api/supabase/client.ts:19-42`, `shared/graphql/client.ts:30-48`). I
found no step in the app that creates a Supabase user row after sign-up: rows
are created by the first write of each table. The "bootstrap" the app does is
the onboarding gate plus key generation.

| # | Step | Log (level, `file:line`) | Sentry | Support looks for |
| --- | --- | --- | --- | --- |
| 1 | Create account, `signUp.create` then `prepareEmailAddressVerification` (`SignUp.tsx:113-120`) fails | error, context `AUTH_SIGNUP_ATTEMPT`, extra `authContext`, `errorType`, `email`, `fullName`, `hasPassword` (`SignUp.tsx:118` via `errorHandler.ts:201`) | none | `[Error] AUTH_SIGNUP_ATTEMPT:` in a device console capture |
| 2 | Same failure, parsed for the form | error `AUTH_CLERK_VALIDATION` with `errorCount`, `errorDetails`, `fieldErrorsGenerated` (`errorHandler.ts:107`); or `AUTH_CLERK_UNEXPECTED_FORMAT` (`:131`); or `AUTH_CLERK_EMPTY_ERROR` with message "An unexpected error occurred. Please try again." (`:42`) | none | Clerk `code` and `paramName` inside `errorDetails` |
| 3 | Verify email code, `EmailVerification.tsx` | error `AUTH_EMAIL_VERIFICATION_ATTEMPT` (`:130`); error `AUTH_EMAIL_VERIFICATION_INCOMPLETE` with message `Verification incomplete.` (`:117`); error `AUTH_EMAIL_VERIFICATION_RESEND` (`:65`) | none | user sees "Verification incomplete. Please try again." |
| 4 | Verified: `ensureEncryptionKey(userMetadata)` (`EmailVerification.tsx:108`) | see Flow 3, `ENCRYPTION_KEY_ENSURE` | see Flow 3 | |
| 5 | Email sign-in, `EmailSignIn.tsx` | warning `AUTH_SIGNIN_INCOMPLETE`, message "Sign-in incomplete. Additional verification may be needed." (`:148`); error `AUTH_SIGNIN_ATTEMPT` (`:156`) | none | Clerk `signInStatus` in the warning's extra |
| 6 | SSO sign-in, `SignIn.tsx` | debug `SSO_SIGNIN_METADATA` (`:101`, development only); error `AUTH_SSO_SIGNIN` with `strategy` (`:116`) | none | |
| 7 | Password reset, `PasswordReset.tsx` | errors `AUTH_PASSWORD_RESET_RESEND` (`:119`), `AUTH_PASSWORD_RESET_CODE_ATTEMPT` (`:174`), `AUTH_PASSWORD_RESET_ATTEMPT` (`:251`) | none | |
| 8 | Onboarding gate reads Clerk metadata (`clerkUserMetadata.ts`) | warnings `CLERK_METADATA_SYNC` "Failed to fetch Clerk private metadata before sync" (`:36`) and "Failed to sync Clerk metadata to private metadata" (`:68`); `CLERK_METADATA_FETCH` "Failed to fetch Clerk private metadata" (`:87`); `CLERK_APP_VERSION_SYNC` (`:116`, `:145`); `CLERK_METADATA_RESET` (`:213`, `:241`) | none | A user stuck in onboarding or never reaching it: these warnings return the old metadata silently |
| 9 | Onboarding gate loads activities (`postAuthOnboardingGate.ts:32`) | warning `POST_AUTH_ONBOARDING` "Activities refresh failed while resolving onboarding" with `userId`, `error` | none | Empty account sent to onboarding because the list did not load |
| 10 | Gate marks an existing account done (`postAuthOnboardingGate.ts:47`) | warning `POST_AUTH_ONBOARDING` "Failed to mark onboarding complete from existing activities" | none | Returning user shown onboarding again |
| 11 | Routing (`app/index.tsx:25`, `OnboardingProvider.tsx:48`) | `app/index.tsx` swallows the gate's rejection and routes to the user's start tab with no log. `OnboardingProvider.tsx:49` logs error with context "Error checking onboarding status" and extra `userId` | none | |
| 12 | Tour finished (`TabsOnboardingTourOverlay.tsx:101`) | `markOnboardingCompleted` failure is swallowed (`catch { /* best-effort */ }`), no log | none | Tour replays on next launch |

Order of the gate (`postAuthOnboardingGate.ts:17-57`): Clerk metadata says done,
go to the tabs; otherwise load activities, and if any exist mark done and go to
the tabs; otherwise onboarding. A fresh empty account lands in onboarding on
purpose.

## Flow 2: API calls

Two transports share one retry and toast pattern.

- REST through supabase-js: `dbCall` (`shared/api/supabase/call.ts:106`).
- GraphQL (pg_graphql) through Apollo: `gqlCall` (`shared/graphql/gqlCall.ts:102`)
  and the Apollo `errorLink` (`shared/graphql/client.ts:50`).

Both retry at most 3 times with exponential backoff capped at 10 s, only for
messages containing `network error`, `timeout`, `connection`, `failed to fetch`
(GraphQL), `temporary`, `rate limit`, `429` (REST), `500`-`504` or `not yet
valid`, and for PostgREST code `PGRST303` ("JWT not yet valid", a cold-launch
race, #332).

| # | Step | Log (level, `file:line`) | Sentry | Support looks for |
| --- | --- | --- | --- | --- |
| 1 | Token fetch: `getAccessToken` / `getGraphqlAuthToken` (`client.ts:19`, `graphql/client.ts:30`) | No log. `ClerkOfflineError` returns `null`, the request goes out without a bearer token and fails server-side | none | A 401 right after going offline |
| 2 | Signed-out data call (`currentUserId`, `supabase/client.ts:72`) | throws `Error("User must be authenticated")`, no log at the throw | none | Caller's own log |
| 3 | REST retry (`call.ts:126`) | warning, context `DB_RETRY_<context>`, message `Attempt 1/4 failed, retrying in <ms>ms`, extra `error` | none | Repeated retries before a failure |
| 4 | REST final failure (`call.ts:137-143`) | error, context `DB_ERROR`, error `DbError` whose message is `[<context>] <original message>`, extra `context`, `originalError`. With `failureLogLevel: "warning"`: warning `DB_ERROR_<context>` (`call.ts:139`). Also toast "Request Failed" plus a plain message | none | The `<context>` in brackets names the call, for example `listTimeslices` |
| 5 | GraphQL transport error (`graphql/client.ts:50-58`) | error `GQL_ERROR` per GraphQL error with `operation`; error `GQL_NETWORK_ERROR` with `operation` | none | `operation` name |
| 6 | GraphQL retry (`gqlCall.ts:126`) | warning `GQL_RETRY_<context>`, message `Attempt n/m failed, retrying in <ms>ms`, extra `error` | none | |
| 7 | GraphQL final failure (`gqlCall.ts:135-139`) | error `GQL_ERROR` (the same context string as step 5), error `DbError`, extra `context`, `originalError`. Toast "Request Failed". GraphQL `errors[]` are joined with `; ` into one `Error` (`gqlCall.ts:115`), and an empty `data` throws `No data returned` (`:118`) | none | |

Toast text chosen by `userMessage` (`call.ts:33`, `gqlCall.ts:25`):

| Message contains | User sees |
| --- | --- |
| network, timeout, connection (GraphQL also `failed to fetch`) | "We couldn't reach our servers. Please check your internet connection and try again." |
| 401, unauthori, token | "You need to sign in again. Please log in to continue." |
| 403, forbid (GraphQL also `permission denied`) | "You don't have permission to do that." |
| rate limit, 429 (REST only) | "You're doing that a bit too quickly. Please wait a moment and try again." |
| encrypt, decrypt (REST only) | "There was a problem accessing secure data. Try restarting the app or contacting support." |
| 500-504, server | "Something went wrong on our end. Please try again later." |
| anything else | "Something went wrong. Please try again." |

No API step reaches Sentry. The Sentry filter matches the Logger context, and
the API contexts (`DB_ERROR`, `GQL_ERROR`, ...) contain none of `ENCRYPT`,
`DECRYPT`, `CDV2`. The `<context>` suffix of `DB_RETRY_`, `DB_ERROR_` and
`GQL_RETRY_` is a call name; none of the call names at the checked commit
contains those words (searched `dbCall(` and `gqlCall(`), but a future one
would silently start reporting.

## Flow 3: encryption

Background: [ADR-001](https://github.com/cadence-day/cadence-app/blob/dev/features/encryption/ADR-001-cdv2-account-identity.md)
(cdv2 envelopes, one identity per account, devices linked by key). Legacy `enc:`
and `cdv1:` rows are still read. Rows are never overwritten with a placeholder
(`decryptionPlaceholder.ts`).

All encryption contexts contain `ENCRYPT`, `DECRYPT` or `CDV2`, so every row
below is also a Sentry event of the stated level with tags from the table in
"What reaches Sentry", unless marked console only. Extras are sanitised twice
(`encryptionSentry.ts:35`, `sentryScrub.ts:57`); a key like `hasKey`,
`keyVersion` or `userId` is dropped on the way out.

| # | Step | Log (level, `file:line`) | Sentry | Support looks for |
| --- | --- | --- | --- | --- |
| 1 | Sign-in, `ensureEncryptionKey` (`core.ts:1327`), existing key found | debug `ENCRYPTION_KEY_ENSURE` | none (debug) | |
| 2 | No key, Clerk says onboarding done (`core.ts:1351`) | warning `ENCRYPTION_KEY_ENSURE` "Existing user detected via Clerk metadata - will NOT generate key", then "User needs to import encryption key via link screen" (`:1356`) | warning, `context=ENCRYPTION_KEY_ENSURE` | Normal for a returning user on a new device |
| 3 | No key, account has activities (`core.ts:1370`) | warning "Existing account detected via activities - user needs to import encryption key", extra `activitiesCount` | warning | |
| 4 | No key, encrypted data flag set (`core.ts:1395`) | warning "Encrypted data flag set but no key - user needs to import key" | warning | |
| 5 | Key generation fails (`core.ts:592`, `:685`) | error `ENCRYPTION_KEY_GENERATION` (extra `message`: "Secure random number generator unavailable; refusing to fall back to a weak key"); error `ENCRYPTION_KEY_STORAGE`, extra `operation: "generate_and_store"` | error, `report=exception` | Keychain / SecureStore failure on that device |
| 6 | `ensureEncryptionKey` throws (`core.ts:1416`) | error `ENCRYPTION_KEY_ENSURE`, extra `message`: "Failed to ensure encryption key exists". Sign-in continues; nothing generates a key later | error | The first save then raises `EncryptionKeyRequiredError` |
| 7 | Reading the stored key fails (`core.ts:732`) | error `ENCRYPTION_KEY_RETRIEVAL`; throws "Failed to read the encryption key from secure storage" | error | |
| 8 | No key on device (`core.ts:744`) | warning `ENCRYPTION_KEY_RETRIEVAL` "No encryption key on this device - the user has to provide one", extra `encryptedDataDetected`; throws `EncryptionKeyRequiredError` | warning | |
| 9 | Own cdv2 identity (`cdv2Bridge.ts`) | warnings: `CDV2_IDENTITY` "cdv2 identity unavailable on this device" (`:185`); `CDV2_IDENTITY` "Could not list cdv2 identities: not signed in" (`:120`); `CDV2_IDENTITY_DEACTIVATED` "cdv2 identity is deactivated in settings; new saves are blocked until it is reactivated" with `keyVersion` (`:170`) | warning | A deactivated identity blocks saves by design (#499) |
| 10 | Publish device public key (`cdv2Bridge.ts:75`) | warning `CDV2_DEVICE_PUBLISH` "Failed to publish device public key for cdv2 — will retry next call", extra `error`. The failure is swallowed. The underlying `gqlCall` also toasts "Request Failed" (Flow 2) | warning | Following saves fail with "Cannot save until this device is linked for cdv2 encryption." |
| 11 | Active identity belongs to another device (`cdv2Bridge.ts:74`, `core.ts:155`) | `Cdv2IdentityConflictError`, no log at the throw; `triggerEncryptionKeyRequired("cdv2_identity_conflict")`. User message: "Another device owns the active encryption identity. Link this device to save." (`core.ts:970`) | one warning `Encryption link prompt: cdv2_identity_conflict (requested via crypto)` | Constraint `user_public_keys_user_active_idx` in the original error |
| 12 | Recipient list refresh fails (`cdv2Bridge.ts:218`) | warning `CDV2_RECIPIENTS` "Failed to refresh cdv2 recipient list, using last-known list" | warning | |
| 13 | Encrypt a new value fails (`core.ts:186`) | warning `CDV2_ENCRYPT_FAILED` "cdv2 encrypt failed; save blocked" | warning | |
| 14 | Save without a usable identity (`core.ts:975`) | warning `ENCRYPTION_KEY_NOT_AVAILABLE_FOR_NEW_DATA` "Cannot save new data: cdv2 encryption is unavailable", extra `plaintextLength`; `triggerEncryptionKeyRequired("encrypt_cdv2_unavailable")` | warning, plus link-prompt event | The user is asked to link; the save fails |
| 15 | Unexpected encrypt error (`core.ts:991`) | error `ENCRYPTION_FAILED` with `plaintextLength`, `error`; throws "Failed to encrypt string"; prompt reason `encrypt_failed` | error | |
| 16 | Decrypt, no key or identity (`core.ts:1167`) | warning `DECRYPTION_KEY_NOT_AVAILABLE` "Cannot decrypt data: this device needs a key or identity", extra `hasCdv2Prefix`, `hasLegacyPrefix`, `hasPersonalV1`; logged once per session. The value becomes `*****`. Prompt reason `decrypt_missing_cdv2_identity` or `decrypt_missing_legacy_key` | warning | The row is intact; this device cannot open it |
| 17 | Decrypt, every identity deactivated (`core.ts:218`) | throws "Every encryption identity on this device is deactivated in Settings → Encryption. Reactivate one to read encrypted names and notes." | none at the throw; the caller logs (step 19) | |
| 18 | Decrypt fails for another reason (`core.ts:1191`) | error `DECRYPTION_FAILED`, extra `encryptedLength`; throws "Failed to decrypt string" | error, `report=exception` | Wrong key, truncated or malformed payload |
| 19 | Row-level fallback (`activities.ts:76`, `notes.ts:58`) | error `DECRYPTION_ACTIVITY_NAME` with `activityId`; error `DECRYPTION_NOTE_MESSAGE` with `noteId`; both with `operation: "decrypt"`, `fallbackBehavior: "return_placeholder"`. The UI shows "Unable to decrypt" (`shared/locales/en.json:348`) | error | Ids are in extras but are UUIDs and are scrubbed (`sentryScrub.ts:17`) |
| 20 | Link prompt chain | per reason, first time only (`core.ts:439`): `reportEncryptionLinkPrompt` then warning `ENCRYPTION_LINK_PROMPT_REQUESTED` "Encryption link prompt requested: &lt;reason&gt;" (`core.ts:448`). UI: `ENCRYPTION_KEY_REQUIRED_PROMPT` "Asking the user for the encryption key this device is missing" (`EncryptionProvider.tsx:421`), `ENCRYPTION_LINK_PROMPT_SUPPRESSED` "Encryption link prompt suppressed; already shown this session" (`:404`), `ENCRYPTION_LINK_PROMPT_DECLINED` "The user declined linking for this session" (`:448`), `ENCRYPTION_LINK_PROMPT_AUTO` (`:517`), `ENCRYPTION_LINK_SCREEN_OPENED` "Navigated to encryption link screen" (`:373`). Launch gate: `encryption.detectNewDevice` "This device cannot read the account's encrypted data - navigating to encryption link screen" (`detectNewDevice.ts:145`) | One event per decision: `Encryption link prompt: <reason> (<requested\|shown\|suppressed\|navigated> via <crypto\|ui_alert\|ui_auto_navigate\|launch_gate>)`, tag `reason`, fingerprint grouped by reason. Duplicate warnings that carry `linkPromptEvent: true` are skipped (`encryptionSentry.ts:68`) | Reasons seen in code: `cdv2_identity_conflict`, `encrypt_cdv2_unavailable`, `encrypt_failed`, `decrypt_missing_cdv2_identity`, `decrypt_missing_legacy_key`, `launch_gate_undecryptable` |
| 21 | Import a key by hand (`core.ts:823`, `:893`, `:901`, `:928`) | warnings `ENCRYPTION_KEY_IMPORT` "Device key rejected: not 64 hex characters", "Import failed: key is empty", "Import failed: invalid key format" with `keyLength`; error with `keyLength`. User sees "That doesn't look like a Cadence key. It should be 64 characters, 0-9 and a-f." | warning or error | `keyLength` not 64 |
| 22 | Provider state (`EncryptionProvider.tsx`) | errors `ENCRYPTION_STATE_REFRESH_FAILED` (`:196`), `ENCRYPTION_NEW_DEVICE_CHECK_FAILED` (`:244`), `ENCRYPTION_KEY_IMPORT_CALLBACK_FAILED` (`:360`), `ENCRYPTION_SHOW_LINK_SCREEN_FAILED` (`:379`), `ENCRYPTION_KEY_REQUIRED_PROMPT_FAILED` (`:455`); warning `ENCRYPTION_NEW_DEVICE_DETECTED` "New-device encryption state: no local key and undecryptable data" with `hasKey`, `hasSeenDialog`, `undecryptable` (`:235`) | error or warning | |
| 23 | Store refresh after a key change (`core.ts:515`, `:533`, `:542`) | warnings `ENCRYPTION_CORE_STORE_REFRESH` and `..._COMPLETE`; error `ENCRYPTION_CORE_STORE_REFRESH_FAILED` | warning, warning, error | |

To triage an "Unable to decrypt" report: in Sentry filter `area:encryption`,
`environment:production` and the user's `release`; look first for
`DECRYPTION_KEY_NOT_AVAILABLE` or a link-prompt `reason` (the device is missing
its identity, row intact) and `DECRYPTION_FAILED` (the device tried and could
not open the row). Nothing in an event names the account.

---

## Gaps

For the deep-fix agent. Each item is a candidate issue, with what is missing.

### Swallowed errors

1. `app/index.tsx:25` `.catch(() => {...})` on `determinePostAuthOnboardingDestination`: no log; the user is routed to a tab even though the gate failed.
2. `features/onboarding/components/TabsOnboardingTourOverlay.tsx:101` `catch { /* best-effort */ }` on `markOnboardingCompleted`: no log, onboarding can replay.
3. `shared/crypto/keySlots.ts:114` `catch { slots = new Set(); }`: a corrupt deactivated-slots value silently becomes "nothing deactivated". Intended (#499) but never logged.
4. `features/encryption/db/cdv2Bridge.ts:75` swallows a publish failure after a warning. The save that follows fails with "Cannot save until this device is linked for cdv2 encryption.", which points the user at linking when the real cause is a network or server failure.
5. `shared/utils/sentry/sentryClient.ts:134` `catch { return false; }` in `initSentry`: an SDK init failure (or `sentryClient.ts:101-103`, a missing DSN) leaves Sentry off with no console line. Nobody can tell "no errors" from "not reporting". Same for `captureRenderError` (`:163`) and `reportEncryptionIssue` (`encryptionSentry.ts:92`).
6. `features/encryption/db/core.ts:439-453`: after the first event per reason, repeats are not logged at all, although a comment (`core.ts:252`) says they "stay on debug".

### Flows with no Sentry capture

7. **Sign-up, sign-in, verification, password reset, SSO**: every `AUTH_*` context (`shared/auth/utils/errorHandler.ts:201`, `:219`) is below the `ENCRYPT|DECRYPT|CDV2` filter. Failed sign-ups and Clerk outages are invisible in Sentry.
8. **Onboarding gate and Clerk metadata sync**: `POST_AUTH_ONBOARDING`, `CLERK_METADATA_*`, `CLERK_APP_VERSION_SYNC` (`postAuthOnboardingGate.ts:32`, `:47`; `clerkUserMetadata.ts:36-241`) and `OnboardingProvider.tsx:49` are console only.
9. **All API failures**: `DB_ERROR`, `DB_ERROR_<ctx>`, `DB_RETRY_<ctx>`, `GQL_ERROR`, `GQL_NETWORK_ERROR`, `GQL_RETRY_<ctx>` (`call.ts:126-141`, `gqlCall.ts:126-136`, `graphql/client.ts:50-58`) never reach Sentry. A broken RLS policy or a pg_graphql schema mismatch shows up only in user reports.
10. **Handled JS exceptions generally**: the filter is the Logger context's name, not severity. `Logger.logError` with any other context is console only. Whether the SDK's default global handlers report unhandled promise rejections is an SDK default and was not verified in app code.
11. `KEY_SLOT_DEACTIVATION_READ` (`core.ts:115`) and `Error checking onboarding status` (`OnboardingProvider.tsx:49`) are failures in encryption and onboarding paths that miss the filter by name.

### Messages a support person cannot act on

12. `OnboardingProvider.tsx:49` passes the message as the Logger context ("Error checking onboarding status"), so the line reads `[Error] Error checking onboarding status:` and the real message is the second argument.
13. `GQL_ERROR` is used for two layers: the per-error link log (`graphql/client.ts:52`, extra `operation`) and the final `gqlCall` failure (`gqlCall.ts:136`, extra `context`, `originalError`). One failure writes both, with different extras and no shared id.
14. `AUTH_CLERK_VALIDATION`, `AUTH_CLERK_UNEXPECTED_FORMAT` and `AUTH_*` log the same failure twice (`SignUp.tsx:118` then `errorHandler.ts:107`), and the second one logs the whole Clerk error object.
15. `ENCRYPTION_KEY_ENSURE` warnings (`core.ts:1351`, `:1356`, `:1370`, `:1395`) describe an ordinary new-device sign-in as a warning. In Sentry these are warning events with no sign of whether the user then linked successfully.
16. `DECRYPTION_FAILED` (`core.ts:1191`) logs only `encryptedLength`. The prefix and which engine failed (`cdv2`, `cdv1`, legacy `enc:`) are known at that point (`isCdv2`, `isLegacyXor`, `isPersonalV1`, `core.ts:1168-1170`) but not attached.
17. `hasKey`, `keyVersion` and similar flags are dropped by the scrubber because the key name contains `key` (`sentryScrub.ts:22-25`). Events from `ENCRYPTION_NEW_DEVICE_DETECTED`, `CDV2_IDENTITY_DEACTIVATED` and the launch gate arrive without the one boolean support needs. Add `hasKey`, `keyVersion` to the safe list or rename them.
18. The error toast "There was a problem accessing secure data..." exists only in `dbCall` (`call.ts:34`), not `gqlCall`, although key publishing and recipient reads run through `gqlCall`.
19. No `Sentry.setUser`, no installation id tag, no `session` tag: a support person cannot connect a user's email to an event. Only release, build, OS and device model are available, plus the time. If an installation UUID is intended (`sentryScrub.ts:113` already allows one) nothing sets it.
20. Noise: `ENCRYPTION_VISUALIZATION_TOGGLE` (`EncryptionProvider.tsx:284`), `ENCRYPTION_DISPLAY_TOGGLE` (`:300`), `ENCRYPTION_KEY_IMPORTED` "Encryption key imported successfully" (`:354`) and `ENCRYPTION_CORE_STORE_REFRESH_COMPLETE` (`core.ts:533`) are successful, user-triggered actions logged with `logWarning`, so each one is a Sentry warning event.

### PII risk in events and logs

21. Sentry: `ENCRYPTION_NEW_DEVICE_ID` (`EncryptionProvider.tsx:210`) sends `deviceId` as an extra. It is not caught by the scrub key list. It is an installation id, not an account id, but it is stable per device and is the only identifier in any event.
22. Sentry: `error` strings in extras and exception messages are only regex-scrubbed. A name or note quoted inside a third-party error message that matches none of the patterns (email, UUID, token, ciphertext, 48+ character blob) would pass. Examples: `core.ts:186` and `cdv2Bridge.ts:75` forward `error.message` as is.
23. Console only, but it reaches anyone who attaches a device log: `AUTH_SIGNUP_ATTEMPT` logs `email` and `fullName` (`SignUp.tsx:118-122`); `AUTH_SIGNIN_ATTEMPT` logs `email` (`EmailSignIn.tsx:156`); `AUTH_EMAIL_VERIFICATION_ATTEMPT` logs `userEmail` and the verification `code` (`EmailVerification.tsx:130-134`); `AUTH_PASSWORD_RESET_CODE_ATTEMPT` logs `email` and `code` (`PasswordReset.tsx:174`); `SSO_SIGNIN_METADATA` logs `userId` and the full Clerk `metadata` (`SignIn.tsx:101`, debug, development only). Production console output includes the others through `Extra context:` (`errorHandler.ts:68-71`). If these ever enter the Sentry filter by renaming, the scrubber drops `email`, `user*`, `code` is not in its key list and would pass.
24. Sentry `context` tag value is the raw Logger context. Any future context built from user input would be an unscrubbed tag value (the tag is scrubbed as a string but its content is not constrained).
