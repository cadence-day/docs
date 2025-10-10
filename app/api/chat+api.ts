import {
  getActivitiesTool,
  getActivityByIdTool,
  getCurrentDateTool,
  getNoteByIdTool,
  getStateByIdTool,
  getTimeslicesForDateTool,
  getUserNotesTool,
  getUserStatesTool,
} from "@/features/chat/tools";
import { SECRETS } from "@/shared/constants/SECRETS";
import { Logger } from "@/shared/utils/errorHandler";
import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";

// System prompt for the AI
const systemPrompt =
  `You are a helpful assistant for Cadence, a time tracking application.
You help users understand their time tracking data, activities, notes, and states.

IMPORTANT: When users ask about their time or activities, you should:
1. First call getCurrentDate to get today's date
2. Then call getTimeslicesForDate with that date to get their time tracking data
3. Then call getActivities to get the full activity details (names, colors, icons)
4. Combine all this information to give a comprehensive, helpful answer

Always use multiple tools in sequence to provide complete answers.
For example, when asked "What did I do today?":
- Call getCurrentDate to get today's date
- Call getTimeslicesForDate with that date
- Call getActivities to get activity names
- Synthesize all the data into a natural, helpful response

Be concise, friendly, and helpful in your responses.`;

export async function POST(request: Request) {
  try {
    // Validate API key
    if (!SECRETS.EXPO_PUBLIC_OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({
          error: "API Key Missing",
          message:
            "EXPO_PUBLIC_OPENAI_API_KEY is not configured. Please add it to your environment variables.",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const { messages } = await request.json();

    // Create OpenAI provider with API key
    const openai = createOpenAI({
      apiKey: SECRETS.EXPO_PUBLIC_OPENAI_API_KEY,
    });

    const result = streamText({
      model: openai("gpt-4o"),
      system: systemPrompt,
      messages,
      // Enable multi-step tool calling with up to 5 steps
      maxSteps: 5,
      tools: {
        getCurrentDate: getCurrentDateTool,
        getTimeslicesForDate: getTimeslicesForDateTool,
        getActivities: getActivitiesTool,
        getActivityById: getActivityByIdTool,
        getUserNotes: getUserNotesTool,
        getNoteById: getNoteByIdTool,
        getUserStates: getUserStatesTool,
        getStateById: getStateByIdTool,
      },
      onStepFinish({ text, toolCalls, toolResults, finishReason, usage }) {
        // Log each step for debugging
        Logger.logDebug("Chat step finished", "chat+api.POST", {
          stepText: text,
          toolCallsCount: toolCalls.length,
          toolResultsCount: toolResults.length,
          finishReason,
          tokensUsed: usage?.totalTokens,
        });

        // Log individual tool calls
        toolCalls.forEach((toolCall) => {
          if (!toolCall.dynamic) {
            Logger.logDebug(
              `Tool called: ${toolCall.toolName}`,
              "chat+api.POST",
              {
                toolCallId: toolCall.toolCallId,
                input: toolCall.input,
              },
            );
          }
        });

        // Log tool results
        toolResults.forEach((toolResult) => {
          if (!toolResult.dynamic) {
            Logger.logDebug(
              `Tool result: ${toolResult.toolName}`,
              "chat+api.POST",
              {
                toolCallId: toolResult.toolCallId,
                output: toolResult.output,
              },
            );
          }
        });
      },
    });

    return result.toDataStreamResponse();
  } catch (error) {
    Logger.logError(error, "chat+api.POST", {
      errorType: "chat_api_error",
    });
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
