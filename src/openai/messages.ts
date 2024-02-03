import { ChatCompletionMessageParam } from "openai/resources/index.mjs";

export const initialMessages: ChatCompletionMessageParam[] = [
  {
    role: "system",
    content:
      "You are a smart Ableton Live Controller. You translate natural language into commands for Ableton Live.",
  },
];
