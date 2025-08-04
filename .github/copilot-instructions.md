# Copilot AI Agent Instructions for Cadence.day Mobile App

## Project Overview
- **Cross-platform mobile app** built with React Native, TypeScript, and Expo.
- Major features: activity tracking, notes (with speech-to-text), AI chat (Sage), calendar integration, notifications, onboarding, and sharing.
- State management: [zustand](https://github.com/pmndrs/zustand).
- Backend: Supabase (API, auth, storage), LangChain/LangGraph for AI, Doppler for secrets.

## Architecture & Patterns
- **Features are modularized** under `features/` (e.g., `features/notes/`, `features/sage/`). Each feature has its own components, dialogs, hooks, services, and types.
- **Shared code** (UI, hooks, stores, utils, types) is in `shared/`.
- **Constants** (e.g., secrets, colors) are in `constants/`.
- **AI/LLM integration**: `features/sage/` uses LangChain/LangGraph SDKs for chat, tool calls, and thread management. See `features/sage/langgraph/` and `features/sage/thread/` for orchestration and message handling.
- **Speech-to-text**: Notes and chat use Groq's Whisper API and `expo-audio` for recording/transcription.
- **Environment variables**: Access via `SECRETS` from `constants/SECRETS.ts` (populated by Doppler or `.env.development`).

## Developer Workflows
- **Start app (Doppler/prod):** `npm start` or `doppler run expo start -c dev`
- **Start app (local dev env):** `npm run start:dev`
- **iOS/Android simulator:** `npm run ios` / `npm run android`
- **Update Expo Go app:** `npm run eas:update`
- **Type generation (Supabase):** `npm run types:update` (prod) or `npm run dev:types:update` (local)
- **Lint/format:** `npm run lint` / `npm run format`
- **Test:** `npm test`
- **Switch between Expo Go and dev build:** Press `s` in Expo CLI terminal

## Project-Specific Conventions
- **Do NOT use Expo development builds**; always use Expo Go for local/simulator/device testing.
- **Environment config:** Use Doppler for secrets in production/staging; `.env.development` for local dev.
- **Type safety:** All data models and API responses should use TypeScript types from `shared/types/`.
- **State:** Use zustand stores in `shared/stores/` for cross-feature state.
- **AI/LLM:** Use LangChain/LangGraph SDKs for all AI features; see `features/sage/` for examples.
- **Speech-to-text:** Use Groq Whisper API via `features/notes/audioUtils.ts` and `features/sage/`.
- **Component structure:** Prefer feature-based folders; keep UI, logic, and types separate.

## Integration Points
- **Supabase:** API, auth, and storage; configured via `SECRETS`.
- **LangChain/LangGraph:** AI chat, tool calls, thread management; see `features/sage/langgraph/`.
- **Groq Whisper:** Speech-to-text for notes and chat.
- **Doppler:** Secrets management for all environments.

## Key Files & Directories
- `features/` — Modular features (activity, notes, sage, etc.)
- `shared/` — Shared UI, hooks, stores, utils, types
- `constants/SECRETS.ts` — Environment/config secrets
- `package.json` — Scripts for all workflows
- `docs/ENVIRONMENT_SETUP.md` — Detailed environment setup
- `README.md` — Project overview and quickstart

---

For new patterns, follow the structure and conventions of existing features. When in doubt, check the README or docs, and prefer composition over inheritance.
