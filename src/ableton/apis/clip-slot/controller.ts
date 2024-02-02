import { AbletonBus } from "../../bus";

export class ClipSlotAPI {
  constructor(private bus: AbletonBus) {}

  /** Create a clip in the slot */
  async createClip(trackIndex: number, clipIndex: number, length: number) {
    return this.bus.sendAndReturn("/live/clip_slot/create_clip", [
      trackIndex,
      clipIndex,
      length,
    ]);
  }

  /** Delete a clip from the slot */
  async deleteClip(trackIndex: number, clipIndex: number) {
    return this.bus.sendAndReturn("/live/clip_slot/delete_clip", [
      trackIndex,
      clipIndex,
    ]);
  }
}
