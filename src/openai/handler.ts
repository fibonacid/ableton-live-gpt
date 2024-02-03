import { logger } from "@/logger";
import { initialMessages } from "./messages";
import { tools } from "./tools";

export async function handler(message: string) {
  const { openai } = await import("./client");
  const stream = await openai.chat.completions.create({
    messages: [
      ...initialMessages,
      {
        role: "user",
        content: message,
      },
    ],
    model: "gpt-4",
    tools: tools,
    stream: true,
  });
  for await (const chunk of stream) {
    const message = chunk.choices[0].delta.content;
    logger.info(message);
  }
}
