import { FunctionDefinition } from "openai/resources/shared.mjs";
import { AbletonBus } from "../bus";

export class SongAPI {
  constructor(private bus: AbletonBus) {}

  /** Start session playback */
  async startPlaying() {
    return this.bus.sendAndReturn("/live/song/start_playing");
  }
  static StartPlaying: FunctionDefinition = {
    name: "song.start_playing",
    description: "Start session playback",
  };

  /** Stop session playback */
  async stopPlaying() {
    return this.bus.sendAndReturn("/live/song/stop_playing");
  }
  static StopPlaying: FunctionDefinition = {
    name: "song.stop_playing",
    description: "Stop session playback",
  };

  /** Set the current song tempo */
  async setTempo(tempo: number) {
    return this.bus.sendAndReturn("/live/song/tempo", [tempo]);
  }
  static SetTempo: FunctionDefinition = {
    name: "song.set_tempo",
    description: "Set the current song tempo",
    parameters: {
      tempo: {
        type: "number",
        description: "The tempo to set",
      },
    },
  };

  /** Jump to next cue point */
  async nextCue() {
    return this.bus.sendAndReturn("/live/song/next_cue");
  }
  static NextCue: FunctionDefinition = {
    name: "song.next_cue",
    description: "Jump to next cue point",
  };

  /** Jump to previous cue point */
  async prevCue() {
    return this.bus.sendAndReturn("/live/song/prev_cue");
  }
  static PrevCue: FunctionDefinition = {
    name: "song.prev_cue",
    description: "Jump to previous cue point",
  };
}
