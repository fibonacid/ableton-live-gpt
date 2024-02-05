import { FunctionDefinition } from "openai/resources/shared.mjs";
import { AbletonBus } from "../bus";

export class SongAPI {
  constructor(private bus: AbletonBus) {}

  async getTempo() {
    return await this.bus.sendAndReturn("/live/song/get/tempo");
  }

  async setTempo(bpm: number) {
    return await this.bus.sendAndReturn("/live/song/set/tempo", bpm);
  }

  async startPlaying() {
    return await this.bus.sendAndReturn("/live/song/start_playing");
  }

  async stopPlaying() {
    return await this.bus.sendAndReturn("/live/song/stop_playing");
  }

  async continuePlaying() {
    return await this.bus.sendAndReturn("/live/song/continue_playing");
  }
}
