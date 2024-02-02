import MaxAPI from "max-api";
import { Ableton } from "./ableton";
import { Logger } from "./logger";

const logger = new Logger();
logger.info("Hello from Node");

const ableton = new Ableton({
  logger,
});

MaxAPI.addHandlers({
  async test() {
    logger.info("handling test command...");
    const result = await ableton.test();
    MaxAPI.outlet(result);
  },
});
