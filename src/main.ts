import { Ableton } from "./ableton";
import { Logger } from "./logger";
import dotenv from "dotenv";

dotenv.config();

const logger = new Logger();
logger.info("Hello from Node");

const ableton = new Ableton({
  logger,
});
