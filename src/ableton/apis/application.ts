import { AbletonBus } from "../bus";

export class ApplicationAPI {
  constructor(private bus: AbletonBus) {}

  /** Display a confirmation message in Live, and sends an OSC reply to /live/test */
  async test() {
    return this.bus.sendAndReturn("/live/test");
  }

  /** Query Live's version */
  async getVersion() {
    const { major_version, minor_version } = await this.bus.sendAndReturn(
      "/live/application/get/version"
    );
    return { major_version, minor_version };
  }

  /** Initiates a live reload of the AbletonOSC server code. Used in development only. */
  async reload() {
    await this.bus.send("/live/api/reload");
  }

  /** Returns the current log level. Default is info. */
  async getLogLevel() {
    const { log_level } = await this.bus.sendAndReturn(
      "/live/api/get/log_level"
    );
    return log_level;
  }

  /** Set the log level, which can be one of: debug, info, warning, error, critical. */
  async setLogLevel(
    log_level: "debug" | "info" | "warning" | "error" | "critical"
  ) {
    await this.bus.send("/live/api/set/log_level", { log_level });
  }
}
