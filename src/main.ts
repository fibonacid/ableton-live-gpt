import dotenv from "dotenv";
import { Logger } from "./logger";
import MaxAPI from "max-api";
import { createAgentExecutor } from "./langchain/agent";
import { HumanMessage } from "langchain/schema";

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
