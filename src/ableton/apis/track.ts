import { FunctionDefinition } from "openai/resources/shared.mjs";
import { AbletonBus } from "../bus";

export class TrackAPI {
  constructor(private bus: AbletonBus) {}

  /** Stop all clips on track */
  async stopAllClips(trackId: number) {
    return this.bus.sendAndReturn("/live/track/stop_all_clips", [trackId]);
  }
  static StopAllClips: FunctionDefinition = {
    name: "track.stop_all_clips",
    description: "Stop all clips on track",
    parameters: {
      trackId: {
        type: "number",
        description: "The index of the track to stop all clips on",
      },
    },
  };

  /** Mute a track */
  async mute(trackId: number) {
    return this.bus.sendAndReturn("/live/track/mute", [trackId]);
  }
  static Mute: FunctionDefinition = {
    name: "track.mute",
    description: "Mute a track",
    parameters: {
      trackId: {
        type: "number",
        description: "The index of the track to mute",
      },
    },
  };

  /** Solo a track */
  async solo(trackId: number) {
    return this.bus.sendAndReturn("/live/track/solo", [trackId]);
  }
  static Solo: FunctionDefinition = {
    name: "track.solo",
    description: "Solo a track",
    parameters: {
      trackId: {
        type: "number",
        description: "The index of the track to solo",
      },
    },
  };

  /** Arm a track for recording */
  async arm(trackId: number) {
    return this.bus.sendAndReturn("/live/track/arm", [trackId]);
  }
  static Arm: FunctionDefinition = {
    name: "track.arm",
    description: "Arm a track for recording",
    parameters: {
      trackId: {
        type: "number",
        description: "The index of the track to arm",
      },
    },
  };
}
