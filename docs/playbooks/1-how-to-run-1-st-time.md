# Playbook 1 - Day 0 at Cadence.day

## Content

1. Pre-requisites
2. Repository
3. Build your first development build
4. Special cases

## Pre-requisites

In order to contribute to `cadence-app`, you'll need:

- XCode (make sure you have `xcodebuild` installed and referenced in PATH)
- Node v22.15.0 - npm/npx should be working.
- Supabase CLI - `brew install supabase/tap/supabase` [^1](You might need to change supabase/.temp/postgres-version to 15.8.1.093)
- Android Studio
- Linear (Team `Development`)

## Repository

Here is the link to our repository:

`https://github.com/cadence-day/cadence-app/`

> **Need access to `cadence-day` organisation?** Write to [bruno@cadence.day](mailto:bruno.adam@cadence.day) with subject `REQUEST ACCESS GITHUB CADENCE-DAY`. If you do not receive access within 30 minutes: write on Discord [#dev]() with `@team` tagged. If not within the 1st hour, call [+ 45 55 21 77 16](tel:+4555217716) on WhatsApp.

The repository contains three central branches:

- `main`: This one is for the build available on App Store (not TestFlight - I really mean App Store)
- `staging`: This one is for the TestFlight version - our beta users might use this one.
- `dev`: This is the branch were we need to resolve all issues. PR are not accepted in `staging` if it does not pass the tests.

## Build your first development build

Open Terminal and run:

1. `npm run clean` : this is a sanitizer function cleaning all eventual built directories and node_modules, package-lock.json.
2. Depending on your tasks:
   - Developer iOS: `npm run ios`
   - Developer Android: `npm run android`
   - Developer Web: `npm run web`
3. It should open the simulator at the end. **For Android**, you will need to open the Simulator from Android Studio.

If there is an issue in the building process:

1. Redo steps 1 and 2
2.
