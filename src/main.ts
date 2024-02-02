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
    const result = await ableton.sendReceive("/live/test");
    MaxAPI.outlet(result);
  },
  async get_live_version() {
    const result = await ableton.sendReceive("/live/application/get/version");
    MaxAPI.outlet(result);
  },
  async get_tempo() {
    const result = await ableton.sendReceive("/live/song/get/tempo");
    MaxAPI.outlet(result);
  },
});
