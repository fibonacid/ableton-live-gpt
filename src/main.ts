import dotenv from "dotenv";
import { Logger } from "./logger";
import MaxAPI from "max-api";
import { handler } from "./openai/handler";

dotenv.config();

export const logger = new Logger();
logger.info("Hello from Node");

MaxAPI.addHandler("text", (...args) => {
  handler(args.join(" "));
});
