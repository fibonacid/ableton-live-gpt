import { FunctionDefinition } from "openai/resources/shared.mjs";

export const applicationFunctions: FunctionDefinition[] = [
  {
    name: "application.get_version",
    description: "Query Live's version",
  },
  {
    name: "application.test",
    description:
      "Display a confirmation message in Live, and sends an OSC reply to /live/test",
  },
  {
    name: "application.reload",
    description:
      "Initiates a live reload of the AbletonOSC server code. Used in development only.",
  },
  {
    name: "application.get_log_level",
    description: "Returns the current log level. Default is info.",
  },
  {
    name: "application.set_log_level",
    description:
      "Set the log level, which can be one of: debug, info, warning, error, critical.",
  },
];
