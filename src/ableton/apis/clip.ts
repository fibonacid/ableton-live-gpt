import { AbletonBus } from "../bus";

export class ClipAPI {
  constructor(private bus: AbletonBus) {}

  /** Start clip playback */
  async fire(trackId: number, clipId: number) {
    return this.bus.sendAndReturn("/live/clip/fire", [trackId, clipId]);
  }

  /** Stop clip playback */
  async stop(trackId: number, clipId: number) {
    return this.bus.sendAndReturn("/live/clip/stop", [trackId, clipId]);
  }

  /** Set the name of a clip */
  async setName(trackId: number, clipId: number, name: string) {
    return this.bus.sendAndReturn("/live/clip/name", [trackId, clipId, name]);
  }
}
