import OSC from "osc-js";
import { Logger } from "../logger";

export class AbletonBus {
  private osc = new OSC({ plugin: new OSC.DatagramPlugin() });
  private logger = new Logger();

  constructor() {
    this.osc.open({ port: 11001, host: "0.0.0.0" });
    this.osc.on("open", () => this.logger.info("OSC open"));
    this.osc.on("error", (err: string) => this.logger.error("OSC error", err));
    this.osc.on("/live/error", (msg: string) =>
      this.logger.error("Ableton error", msg)
    );
  }

  destroy() {
    this.osc.close();
  }

  async send(address: string, ...args: any) {
    this.osc.send(new OSC.Message(address, ...args), {
      port: 11000,
      host: "127.0.0.1",
    });
  }

  async receive(address: string) {
    return new Promise<any>((resolve, reject) => {
      const timeout = setTimeout(() => reject("Timeout"), 1000);
      const unsubscribe = this.osc.on(address, (message: string) => {
        clearTimeout(timeout);
        this.osc.off(address, unsubscribe); // remove listener
        resolve(message); // forward message
      });
    });
  }

  async sendAndReturn(address: string, ...args: any) {
    await this.send(address, ...args);
    const msg = await this.receive(address);
    return msg;
  }
}