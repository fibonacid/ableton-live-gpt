import { AbletonBus } from "../../bus";

export class ApplicationAPI {
  constructor(private bus: AbletonBus) {}

  /** Display a confirmation message in Live, and sends an OSC reply to /live/test */
  test() {
    return this.bus.sendAndReturn("/live/test");
  }

  /** Query Live's version */
  getVersion() {
    return this.bus.sendAndReturn("/live/application/get/version");
  }

  /** Initiates a live reload of the AbletonOSC server code. Used in development only. */
  reload() {
    return this.bus.send("/live/api/reload");
  }

  /** Returns the current log level. Default is info. */
  getLogLevel() {
    return this.bus.sendAndReturn("/live/api/get/log_level");
  }

  /** Set the log level, which can be one of: debug, info, warning, error, critical. */
  setLogLevel(log_level: "debug" | "info" | "warning" | "error" | "critical") {
    this.bus.send("/live/api/set/log_level", { log_level });
  }
}
