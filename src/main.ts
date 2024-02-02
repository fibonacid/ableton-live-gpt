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
    const result = await ableton.sendReceive("/live/tempo");
    MaxAPI.outlet(result);
  },
  async get_live_version() {
    logger.info("handling get_live_version command...");
    const result = await ableton.sendReceive("/live/application/get/version");
    MaxAPI.outlet(result);
  },
  async get_tempo() {
    logger.info("handling get_tempo command...");
    const result = await ableton.sendReceive("/live/song/get/tempo");
    MaxAPI.outlet(result);
  },
});
