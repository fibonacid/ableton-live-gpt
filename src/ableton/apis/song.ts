import { FunctionDefinition } from "openai/resources/shared.mjs";
import { AbletonBus } from "../bus";

export class SongAPI {
  constructor(private bus: AbletonBus) {}

  async getTempo() {
    return await this.bus.sendAndReturn("/live/song/get/tempo");
  }
}
