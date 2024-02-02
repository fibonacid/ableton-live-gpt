import { AbletonController } from "../ableton/controller";

const controller = new AbletonController();

export const functionMap = {
  "application.get_version": controller.application.getVersion,
  "application.test": controller.application.test,
  "application.reload": controller.application.reload,
  "application.get_log_level": controller.application.getLogLevel,
  "application.set_log_level": controller.application.setLogLevel,
  "track.arm": controller.track.arm,
  "track.mute": controller.track.mute,
  "track.solo": controller.track.solo,
  "track.stop_all_clips": controller.track.stopAllClips,
} as const;

export type FunctionName = keyof typeof functionMap;
