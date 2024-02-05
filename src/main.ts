import dotenv from "dotenv";
import MaxAPI from "max-api";
import { controller } from "./ableton/controller";
import { Logger } from "./logger";

dotenv.config();

export const logger = new Logger();
logger.info("Hello from Node");

MaxAPI.addHandler("text", async (...args) => {
  const message = args.join(" ");
  const { executor } = await import("./langchain/agent");
  logger.info(`Sending message to agent: '${message}'`);
  try {
    const response = await executor.invoke({ input: message });
    logger.info("Agent Response", JSON.stringify(response));
  } catch (err) {
    logger.error("Agent Error:", err);
  }
});

MaxAPI.addHandler("test", async () => {
  const result = await controller.application.test();
  logger.info(result);
});
