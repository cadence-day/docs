import useStatesStore from "@/shared/stores/resources/useStatesStore";
import { tool } from "ai";
import { format } from "date-fns";
import { z } from "zod";

export const getUserStatesTool = tool({
  description:
    "Get all states for the current user. Returns a list of all user states with their values, timestamps, and associated timeslices.",
  inputSchema: z.object({}),
  execute: async () => {
    try {
      const store = useStatesStore.getState();
      const states = store.states;

      if (!states || states.length === 0) {
        return {
          success: false,
          message: "No states found",
          data: [],
        };
      }

      return {
        success: true,
        message: `Found ${states.length} state${
          states.length !== 1 ? "s" : ""
        }`,
        data: states.map((state) => ({
          id: state.id,
          value: state.value,
          timesliceId: state.timeslice_id,
          createdAt: state.created_at
            ? format(new Date(state.created_at), "yyyy-MM-dd HH:mm:ss")
            : null,
        })),
      };
    } catch (error) {
      return {
        success: false,
        message: `Error fetching states: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        data: [],
      };
    }
  },
});

export const getStateByIdTool = tool({
  description: "Get a specific state by its ID",
  inputSchema: z.object({
    stateId: z.string().describe("The ID of the state to fetch"),
  }),
  execute: async ({ stateId }) => {
    try {
      const store = useStatesStore.getState();
      const state = await store.getState(stateId);

      if (!state) {
        return {
          success: false,
          message: `State with ID ${stateId} not found`,
          data: null,
        };
      }

      return {
        success: true,
        message: "State found",
        data: {
          id: state.id,
          value: state.value,
          timesliceId: state.timeslice_id,
          createdAt: state.created_at
            ? format(new Date(state.created_at), "yyyy-MM-dd HH:mm:ss")
            : null,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: `Error fetching state: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        data: null,
      };
    }
  },
});
