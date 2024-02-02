import type { FunctionDefinition } from "openai/resources/shared.mjs";

export const trackFunctions: FunctionDefinition[] = [
  {
    name: "track.stop_all_clips",
    description: "Stop all clips on track",
    parameters: {
      trackIndex: {
        type: "number",
        description: "The index of the track to stop all clips on",
      },
    },
  },
  {
    name: "track.mute",
    description: "Mute a track",
    parameters: {
      trackIndex: {
        type: "number",
        description: "The index of the track to mute",
      },
    },
  },
  {
    name: "track.solo",
    description: "Solo a track",
    parameters: {
      trackIndex: {
        type: "number",
        description: "The index of the track to solo",
      },
    },
  },
  {
    name: "track.arm",
    description: "Arm a track for recording",
    parameters: {
      trackIndex: {
        type: "number",
        description: "The index of the track to arm",
      },
    },
  },
];
