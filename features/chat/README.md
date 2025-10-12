# Chat Feature

AI-powered chat interface for Cadence time tracking app with Apple Intelligence and Anthropic Claude integration.

## Overview

The chat feature allows users to ask questions about their time tracking data using natural language. It intelligently uses Apple Intelligence when available on iOS 26+ devices, and falls back to Anthropic Claude on other platforms.

## Feature Flag

This feature is controlled by the PostHog feature flag `"chat"`. To enable it:

1. Go to your PostHog dashboard
2. Navigate to Feature Flags
3. Create or enable the feature flag with key: `chat`
4. The feature will automatically show/hide based on this flag

## Setup

### 1. Environment Variables

Add the following to your `.env.development` or `.env.production`:

```bash
EXPO_PUBLIC_ANTHROPIC_API_KEY="your_anthropic_api_key_here"
```

Get your API key from [Anthropic Console](https://console.anthropic.com/)

### 2. PostHog Feature Flag

Enable the `chat` feature flag in your PostHog dashboard.

## Architecture

### Components

- **ChatScreen** ([/components/ChatScreen.tsx](components/ChatScreen.tsx)) - Main chat interface with AI integration
- **ChatInput** ([/components/ChatInput.tsx](components/ChatInput.tsx)) - Message input component
- **ChatMessage** ([/components/ChatMessage.tsx](components/ChatMessage.tsx)) - Message display component

### Tools

The chat assistant has access to the following tools to fetch user data:

#### Timeslices
- `getTimeslicesForDateTool` - Fetch timeslices for a specific date or date range

#### Activities
- `getActivitiesTool` - Get all user activities
- `getActivityByIdTool` - Get a specific activity by ID

#### Notes
- `getUserNotesTool` - Get all user notes
- `getNoteByIdTool` - Get a specific note by ID

#### States
- `getUserStatesTool` - Get all user states
- `getStateByIdTool` - Get a specific state by ID

## AI Provider Logic

The chat feature uses the following provider logic:

1. **Apple Intelligence (Primary)** - Used when available on iOS 26+ devices
   - Utilizes on-device AI processing
   - No API keys required
   - Faster responses with better privacy

2. **Anthropic Claude (Fallback)** - Used when Apple Intelligence is not available
   - Requires `EXPO_PUBLIC_ANTHROPIC_API_KEY`
   - Uses Claude 3.5 Sonnet model
   - Streaming responses for better UX

## Usage Examples

Users can ask questions like:

- "What activities did I work on today?"
- "Show me my timeslices from last week"
- "What notes did I add yesterday?"
- "How much time did I spend on each activity this month?"

## File Structure

```
features/chat/
├── components/
│   ├── ChatScreen.tsx      # Main chat UI with AI integration
│   ├── ChatInput.tsx       # Message input component
│   ├── ChatMessage.tsx     # Message bubble component
│   └── index.ts           # Component exports
├── tools/
│   ├── timeslices.ts      # Timeslice data tools
│   ├── activities.ts      # Activity data tools
│   ├── notes.ts          # Notes data tools
│   ├── states.ts         # States data tools
│   └── index.ts          # Tool exports
├── index.ts              # Main feature exports
└── README.md            # This file
```

## Navigation

The chat feature is accessible via the bottom tab navigation in the app. It appears as a tab between "Reflection" and "Profile".

## Development

### Adding New Tools

To add new tools for the AI to use:

1. Create a new tool file in `tools/` using the Vercel AI SDK's `tool()` function
2. Export it from `tools/index.ts`
3. Add it to the `tools` object in `ChatScreen.tsx`

Example:

```typescript
import { tool } from "ai";
import { z } from "zod";

export const myNewTool = tool({
  description: "Description of what this tool does",
  parameters: z.object({
    param1: z.string().describe("Parameter description"),
  }),
  execute: async ({ param1 }) => {
    // Implementation
    return { success: true, data: result };
  },
});
```

### Testing

To test the chat feature:

1. Enable the `chat` feature flag in PostHog
2. Add your Anthropic API key to `.env.development`
3. Run the app and navigate to the Chat tab
4. Ask questions about your time tracking data

## Troubleshooting

### Chat tab not showing
- Check that the `chat` feature flag is enabled in PostHog
- Restart the app after enabling the flag

### "API Key Missing" error
- Ensure `EXPO_PUBLIC_ANTHROPIC_API_KEY` is set in your environment
- Restart the development server after adding the key

### No responses from AI
- Check your Anthropic API key is valid
- Ensure you have API credits available
- Check console logs for error messages
