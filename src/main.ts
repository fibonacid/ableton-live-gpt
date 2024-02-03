import dotenv from "dotenv";
import { Logger } from "./logger";
import { initialMessages } from "./openai/messages";
import { tools } from "./openai/tools";

dotenv.config();

const logger = new Logger();
logger.info("Hello from Node");

async function main() {
  const { openai } = await import("./openai/client");
  const stream = await openai.chat.completions.create({
    messages: initialMessages,
    model: "gpt-4",
    tools: tools,
    stream: true,
  });
  for await (const chunk of stream) {
    const [choice] = chunk.choices;
    const toolCalls = choice.delta.tool_calls;
    if (toolCalls) {
      for (const toolCall of toolCalls) {
        logger.info(`Tool call: ${JSON.stringify(toolCall)}`);
      }
    }
  }
}

main();
