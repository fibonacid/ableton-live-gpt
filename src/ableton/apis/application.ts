import { FunctionDefinition } from "openai/resources/shared.mjs";
import { AbletonBus } from "../bus";

export class ApplicationAPI {
  constructor(private bus: AbletonBus) {}

  /** Display a confirmation message in Live, and sends an OSC reply to /live/test */
  test() {
    return this.bus.sendAndReturn("/live/test");
  }
  static Test: FunctionDefinition = {
    name: "application__test",
    description:
      "Display a confirmation message in Live, and sends an OSC reply to /live/test",
  };

  /** Query Live's version */
  getVersion() {
    return this.bus.sendAndReturn("/live/application/get/version");
  }
  static GetVersion: FunctionDefinition = {
    name: "application__get_version",
    description: "Query Live's version",
  };

  /** Initiates a live reload of the AbletonOSC server code. Used in development only. */
  reload() {
    return this.bus.send("/live/api/reload");
  }
  static Reload: FunctionDefinition = {
    name: "application__reload",
    description:
      "Initiates a live reload of the AbletonOSC server code. Used in development only.",
  };

  /** Returns the current log level. Default is info. */
  getLogLevel() {
    return this.bus.sendAndReturn("/live/api/get/log_level");
  }
  static GetLogLevel: FunctionDefinition = {
    name: "application__get_log_level",
    description: "Returns the current log level. Default is info.",
  };

  /** Set the log level, which can be one of: debug, info, warning, error, critical. */
  setLogLevel(log_level: "debug" | "info" | "warning" | "error" | "critical") {
    this.bus.send("/live/api/set/log_level", { log_level });
  }
  static SetLogLevel: FunctionDefinition = {
    name: "application__set_log_level",
    description:
      "Set the log level, which can be one of: debug, info, warning, error, critical.",
    parameters: {
      log_level: {
        type: "string",
        description: "The log level to set",
      },
    },
  };
}
