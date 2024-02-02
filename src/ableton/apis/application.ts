import { AbletonBus } from "../bus";

export class ApplicationAPI {
  constructor(private bus: AbletonBus) {}

  /** Display a confirmation message in Live, and sends an OSC reply to /live/test */
  async test() {
    return this.bus.sendAndReturn("/live/test");
  }
}
