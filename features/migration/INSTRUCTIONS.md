# Migration Spec — System 1 (Supabase Auth / `LEGACY_SCHEMA.sql`) → System 2 (Supabase + Clerk / `shared/stores/`)

## Scope

Migrate only:

- `activities`
- `timeslices`
- `notes`
- `states`

**Do not migrate:**
`profiles`, `user_preferences`, or anything else.

---

## High-level flow

1. Operator provides:
   - Source Supabase connection (v1)
   - Target Supabase connection (v2)

2. Tool fetches **activities** from v1 and presents them in a UI. Each source activity has a dropdown to either:
   - Map to an existing v2 activity, or
   - Create a new v2 activity

3. After mapping, migration runs in order:
   - Activities
   - Timeslices (with UTC → local conversion)
   - Notes (decrypt only if key is available and note is encrypted)
   - States (with UTC → local conversion)

4. Migration writes into v2 using **`shared/stores/`**, not raw SQL.
   Mapping helper tables (`migration.activity_map`, etc.) are created directly in v2 DB.

---

## Datetime handling

- **System 1:** `timestamp with time zone` = UTC.
- **System 2:** stores expect **local time**.
- Migration must:
  - Convert `start_time`, `end_time` from UTC → local using each user’s timezone.
  - Store both source and converted values in `migration.log.meta` for audit.

Example log:

```json
{
  "src_start_time_utc": "2024-03-10T12:00:00Z",
  "dest_start_time_local": "2024-03-10T13:00:00+01:00"
}
```

---

## Data model mapping

### Activities

- Source: `activities.activity_id` → Target: `activities.id` (create an activity_map to track this)
- Fields: `name, color`
- `weight` = 0.5 for all migrated activities, no parent-child relationships, choose activity_categories in the migration UI.
- `user_id`: convert `uuid` → string for v2

### Timeslices

- Source: `timeslices.timeslice_id` → Target: `timeslices.id`
- Map:
  - `activity_id` via `migration.activity_map`
  - `user_id`: uuid → string
  - `state_id` via `migration.state_map` (first pass with null, insert states later)
  - `note_ids` array: append migrated notes (first create without notes and insert notes later)
- Convert datetime fields UTC → local date. (`start_time`, `end_time`)

### Notes

- Source: `notes.note_id` → Target: `notes.id`
- Behavior:
  - Check AsyncStorage for encryption key under **`@cadence_encryption_key`**:
    - If found, show **“ok”** status in UI.
    - If not found, show warning: **“Unable to decrypt encrypted notes”**.

  - For each note:
    - If message is encrypted **and** key available → decrypt before inserting.
    - If message is encrypted **and** no key available → insert with `message = "[UNABLE_TO_DECRYPT]"` and log.
    - If message is plaintext → migrate as-is.

- Attach to timeslice using `migration.timeslice_map`.

### States

- Source: `states.state_id` → Target: `states.id`
- Map `timeslice_id` via `migration.timeslice_map`
- Only add `energy` field if present.

---

## Migration bookkeeping

Add helper tables in target DB (`migration.*` schema):

- `activity_map`
- `timeslice_map`
- `note_map`
- `state_map`
- `log`

These enforce **idempotency** and allow resuming.

---

## UI requirements

### Profile screen

- Add a **`CdOneLine` item** (e.g. in Settings section) labeled **“Migrate Data”**.
- On press → navigates to `app/settings/migration`.

### Migration screen (`app/settings/migration`)

- Dedicated screen implementing all logic from `features/migration`.
- Contains:
  - Activities mapping table:
    - Left: source activities
    - Right: dropdown (map existing v2 activity / create new)

  - Encryption key status:
    - If AsyncStorage has `@cadence_encryption_key` → show small **“ok”** indicator.
    - If not → show **warning** that encrypted notes cannot be decrypted.

  - Buttons:
    - **Dry run**
    - **Migrate activities**
    - **Migrate timeslices**
    - **Migrate notes**
    - **Migrate states**
    - **Full run**

  - Progress + counts
  - Error + audit logs

---

## UI flow sketch

### Component hierarchy

```
ProfileScreen
 └─ CdTextInputOneLine("Migrate Data from v1") → navigate("app/settings/migration")

MigrationScreen
 ├─ EncryptionKeyStatus (reads @cadence_encryption_key from AsyncStorage)
 ├─ ActivityMappingTable
 │   ├─ ActivityRow (source name, dropdown for target mapping)
 ├─ MigrationActions
 │   ├─ Button("Dry Run")
 │   ├─ Button("Migrate Activities")
 │   ├─ Button("Migrate Timeslices")
 │   ├─ Button("Migrate Notes")
 │   ├─ Button("Migrate States")
 │   ├─ Button("Full Run")
 ├─ ProgressIndicator
 └─ LogsView
```

### AsyncStorage key check snippet

```tsx
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Text, View } from "react-native";

export function EncryptionKeyStatus() {
  const [status, setStatus] = useState<"checking" | "ok" | "missing">(
    "checking"
  );

  useEffect(() => {
    AsyncStorage.getItem("@cadence_encryption_key").then((key) => {
      setStatus(key ? "ok" : "missing");
    });
  }, []);

  return (
    <View>
      {status === "checking" && <Text>Checking encryption key…</Text>}
      {status === "ok" && <Text style={{ color: "green" }}>Key found ✔</Text>}
      {status === "missing" && (
        <Text style={{ color: "red" }}>Unable to decrypt encrypted notes</Text>
      )}
    </View>
  );
}
```

---

## Implementation structure

### Files

- `features/migration/`:
  - `MigrationScreen.tsx` → UI logic
  - `components/EncryptionKeyStatus.tsx`
  - `hooks/useMigration.ts` → orchestrates API calls, progress state
  - `api/migration.ts` → client → server API

- `features/migration/api/`:
  - `index.ts` → routes: `/dry-run`, `/migrate/activities`, `/migrate/timeslices`, `/migrate/notes`, `/migrate/states`

- `shared/stores/` → used for writing to v2 DB (activities, timeslices, notes, states)

### Utilities

- `features/migration/lib/dateConversion.ts` → `convertUtcToLocal(date: Date, tz: string): Date`
- `features/migration/lib/decryptor.ts` →
  - Reads `@cadence_encryption_key` from AsyncStorage.
  - Provides `decryptMessage(message: string, key?: string): string | null`.
  - Skips if note is not encrypted.

- `features/migration/lib/migrationStore.ts` → manages mapping tables + logs

---

## Migration algorithm

(Same as before, with datetime conversion and selective note decryption using AsyncStorage key.)
