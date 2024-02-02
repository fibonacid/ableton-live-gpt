import { FunctionDefinition } from "openai/resources/shared.mjs";

export const clipSlotFunctions: FunctionDefinition[] = [
  {
    name: "clip-slot.create_clip",
    description: "Create a clip in the slot",
    parameters: {
      trackIndex: {
        type: "number",
        description: "The index of the track to create the clip in",
      },
      clipIndex: {
        type: "number",
        description: "The index of the clip in the track",
      },
      length: {
        type: "number",
        description: "The length of the clip in beats",
      },
    },
  },
  {
    name: "clip-slot.delete_clip",
    description: "Delete a clip from the slot",
    parameters: {
      trackIndex: {
        type: "number",
        description: "The index of the track to delete the clip from",
      },
      clipIndex: {
        type: "number",
        description: "The index of the clip in the track",
      },
    },
  },
];
