import { FunctionDefinition } from "openai/resources/shared.mjs";
import { AbletonBus } from "../bus";

export class ClipAPI {
  constructor(private bus: AbletonBus) {}

  /** Start clip playback */
  async fire(trackId: number, clipId: number) {
    return this.bus.sendAndReturn("/live/clip/fire", [trackId, clipId]);
  }
  static Fire: FunctionDefinition = {
    name: "clip__fire",
    description: "Start clip playback",
    parameters: {
      trackId: {
        type: "number",
        description: "The index of the track to play the clip in",
      },
      clipId: {
        type: "number",
        description: "The index of the clip in the track",
      },
    },
  };

  /** Stop clip playback */
  async stop(trackId: number, clipId: number) {
    return this.bus.sendAndReturn("/live/clip/stop", [trackId, clipId]);
  }
  static Stop: FunctionDefinition = {
    name: "clip__stop",
    description: "Stop clip playback",
    parameters: {
      trackId: {
        type: "number",
        description: "The index of the track to stop the clip in",
      },
      clipId: {
        type: "number",
        description: "The index of the clip in the track",
      },
    },
  };

  /** Set the name of a clip */
  async setName(trackId: number, clipId: number, name: string) {
    return this.bus.sendAndReturn("/live/clip/name", [trackId, clipId, name]);
  }
  static SetName: FunctionDefinition = {
    name: "clip__set_name",
    description: "Set the name of a clip",
    parameters: {
      trackId: {
        type: "number",
        description: "The index of the track to set the clip name in",
      },
      clipId: {
        type: "number",
        description: "The index of the clip in the track",
      },
      name: {
        type: "string",
        description: "The name to set the clip to",
      },
    },
  };
}
