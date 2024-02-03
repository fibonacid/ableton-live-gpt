import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import { SongAPI } from "../ableton/apis/song";

export const initialMessages: ChatCompletionMessageParam[] = [
  {
    role: "system",
    content:
      "You are a smart Ableton Live Controller. You translate natural language into commands for Ableton Live.",
  },
  {
    role: "user",
    content: "Set the tempo to 130 bpm.",
  },
  {
    role: "assistant",
    content: "I have set the tempo to 130 bpm.",
    tool_calls: [
      {
        id: "0",
        type: "function",
        function: {
          name: SongAPI.SetTempo.name,
          arguments: "",
        },
      },
    ],
  },
];
