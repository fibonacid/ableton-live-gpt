import dotenv from "dotenv";
import MaxAPI from "max-api";
import { controller } from "./ableton/controller";
import { createAgentExecutor } from "./langchain/agent";
import { Logger } from "./logger";

dotenv.config();

export const logger = new Logger();
logger.info("Hello from Node");

MaxAPI.addHandler("text", async (...args) => {
  const message = args.join(" ");
  logger.info(`Received message: ${message}`);
  const agentExecutor = await createAgentExecutor();
  const response = await agentExecutor.invoke({
    input: message,
  });
  logger.info(`Response: ${JSON.stringify(response)}`);
});

MaxAPI.addHandler("test", async () => {
  logger.info("Test message");
  const result = await controller.application.test();
  logger.info(`Result: ${JSON.stringify(result)}`);
});
