import { FunctionDefinition } from "openai/resources/shared.mjs";
import { AbletonBus } from "../bus";

export class SongAPI {
  constructor(private bus: AbletonBus) {}

  private async exec(path: string, ...args: any[]) {
    return await this.bus.sendAndReturn(`/live/song/${path}`, args);
  }

  async getTempo() {
    return await this.exec("get/tempo");
  }

  async setTempo(bpm: number) {
    return await this.exec("set/tempo", bpm);
  }

  async startPlaying() {
    return await this.exec("start_playing");
  }

  async stopPlaying() {
    return await this.exec("stop_playing");
  }

  async continuePlaying() {
    return await this.exec("continue_playing");
  }

  async isPlaying() {
    return await this.exec("get/is_playing");
  }

  async captureMidi() {
    return await this.exec("capture_midi");
  }
}
