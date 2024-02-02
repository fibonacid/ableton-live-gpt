import { AbletonBus } from "../../bus";

export class SongAPI {
  constructor(private bus: AbletonBus) {}

  /** Start session playback */
  async startPlaying() {
    return this.bus.sendAndReturn("/live/song/start_playing");
  }

  /** Stop session playback */
  async stopPlaying() {
    return this.bus.sendAndReturn("/live/song/stop_playing");
  }

  /** Set the current song tempo */
  async setTempo(tempo: number) {
    return this.bus.sendAndReturn("/live/song/tempo", [tempo]);
  }

  /** Jump to next cue point */
  async nextCue() {
    return this.bus.sendAndReturn("/live/song/next_cue");
  }

  /** Jump to previous cue point */
  async prevCue() {
    return this.bus.sendAndReturn("/live/song/prev_cue");
  }
}
