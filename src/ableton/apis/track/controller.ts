import { AbletonBus } from "../../bus";

export class TrackAPI {
  constructor(private bus: AbletonBus) {}

  /** Stop all clips on track */
  async stopAllClips(trackId: number) {
    return this.bus.sendAndReturn("/live/track/stop_all_clips", [trackId]);
  }

  /** Mute a track */
  async mute(trackId: number) {
    return this.bus.sendAndReturn("/live/track/mute", [trackId]);
  }

  /** Solo a track */
  async solo(trackId: number) {
    return this.bus.sendAndReturn("/live/track/solo", [trackId]);
  }

  /** Arm a track for recording */
  async arm(trackId: number) {
    return this.bus.sendAndReturn("/live/track/arm", [trackId]);
  }
}
