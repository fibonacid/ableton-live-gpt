import { FunctionDefinition } from "openai/resources/shared.mjs";

export const songFunctions: FunctionDefinition[] = [
  {
    name: "song.get_tempo",
    description: "Get the tempo of the song",
  },
  {
    name: "song.set_tempo",
    description: "Set the tempo of the song",
    parameters: {
      tempo: {
        type: "number",
        description: "The tempo to set",
      },
    },
  },
  {
    name: "song.get_time_signature",
    description: "Get the time signature of the song",
  },
  {
    name: "song.set_time_signature",
    description: "Set the time signature of the song",
    parameters: {
      numerator: {
        type: "number",
        description: "The numerator of the time signature",
      },
      denominator: {
        type: "number",
        description: "The denominator of the time signature",
      },
    },
  },
  {
    name: "song.get_playing",
    description: "Get the playing state of the song",
  },
  {
    name: "song.set_playing",
    description: "Set the playing state of the song",
    parameters: {
      playing: {
        type: "boolean",
        description: "The playing state to set",
      },
    },
  },
  {
    name: "song.get_playing_position",
    description: "Get the playing position of the song",
  },
  {
    name: "song.set_playing_position",
    description: "Set the playing position of the song",
    parameters: {
      position: {
        type: "number",
        description: "The position to set",
      },
    },
  },
  {
    name: "song.get_looping",
    description: "Get the looping state of the song",
  },
  {
    name: "song.set_looping",
    description: "Set the looping state of the song",
    parameters: {
      looping: {
        type: "boolean",
        description: "The looping state to set",
      },
    },
  },
  {
    name: "song.get_arrangement_overdub",
    description: "Get the arrangement overdub state of the song",
  },
  {
    name: "song.set_arrangement_overdub",
    description: "Set the arrangement overdub state of the song",
    parameters: {
      overdub: {
        type: "boolean",
        description: "The arrangement overdub state to set",
      },
    },
  },
];
