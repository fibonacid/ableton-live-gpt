import { AbletonBus } from "./ableton/bus";
import { Logger } from "./logger";
import dotenv from "dotenv";

dotenv.config();

const logger = new Logger();
logger.info("Hello from Node");

const ableton = new AbletonBus({
  logger,
});
