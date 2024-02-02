import { ChatCompletionTool } from "openai/resources/index.mjs";

export const tools: ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "application.get_version",
      description: "Query Live's version",
    },
  },
  {
    type: "function",
    function: {
      name: "application.test",
      description:
        "Display a confirmation message in Live, and sends an OSC reply to /live/test",
    },
  },
  {
    type: "function",
    function: {
      name: "application.reload",
      description: "Initiates a live reload of the AbletonOSC server code",
    },
  },
  {
    type: "function",
    function: {
      name: "application.get_log_level",
      description: "Returns the current log level. Default is info.",
    },
  },
  {
    type: "function",
    function: {
      name: "application.set_log_level",
      description:
        "Set the log level, which can be one of: debug, info, warning, error, critical.",
    },
  },
  {
    type: "function",
    function: {
      name: "track.arm",
      description: "Arm a track",
    },
  },
  {
    type: "function",
    function: {
      name: "track.mute",
      description: "Mute a track",
    },
  },
  {
    type: "function",
    function: {
      name: "track.solo",
      description: "Solo a track",
    },
  },
  {
    type: "function",
    function: {
      name: "track.get_name",
      description: "Get the name of a track",
    },
  },
];
