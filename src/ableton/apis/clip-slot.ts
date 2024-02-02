import { FunctionDefinition } from "openai/resources/shared.mjs";
import { AbletonBus } from "../bus";

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
  static CreateClip: FunctionDefinition = {
    name: "clip_slot.create_clip",
    description: "Create a clip in the slot",
    parameters: {
      trackIndex: {
        type: "number",
        description: "The index of the track to create the clip in",
      },
      clipIndex: {
        type: "number",
        description: "The index of the clip in the track",
      },
      length: {
        type: "number",
        description: "The length of the clip in beats",
      },
    },
  };

  /** Delete a clip from the slot */
  async deleteClip(trackIndex: number, clipIndex: number) {
    return this.bus.sendAndReturn("/live/clip_slot/delete_clip", [
      trackIndex,
      clipIndex,
    ]);
  }
  static DeleteClip: FunctionDefinition = {
    name: "clip_slot.delete_clip",
    description: "Delete a clip from the slot",
    parameters: {
      trackIndex: {
        type: "number",
        description: "The index of the track to delete the clip from",
      },
      clipIndex: {
        type: "number",
        description: "The index of the clip in the track",
      },
    },
  };
}
