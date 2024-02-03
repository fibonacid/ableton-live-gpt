import dotenv from "dotenv";
import { Logger } from "./logger";
import MaxAPI from "max-api";

dotenv.config();

export const logger = new Logger();
logger.info("Hello from Node");

MaxAPI.addHandler("text", async (...args) => {
  const message = args.join(" ");
  logger.info(`Received message: ${message}`);
  const { handler } = await import("./langchain/chat");
  const response = await handler(message);
  logger.info(`Response: ${response}`);
});
