import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import { SongAPI } from "../ableton/apis/song";

export const initialMessages: ChatCompletionMessageParam[] = [
  {
    role: "system",
    content:
      "You are a smart Ableton Live Controller. You translate natural language into commands for Ableton Live.",
  },
];
