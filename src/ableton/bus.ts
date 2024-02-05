import OSC from "osc-js";
import { logger } from "../logger";

export class AbletonBus {
  private osc = new OSC({ plugin: new OSC.DatagramPlugin() });

  constructor() {
    this.osc.open({ port: 11001, host: "0.0.0.0" });
    this.osc.on("open", () => logger.info("OSC open"));
    this.osc.on("error", (err: string) => logger.error("OSC error", err));
    this.osc.on("/live/error", (msg: string) =>
      logger.error("Ableton error", msg)
    );
  }

  destroy() {
    this.osc.close();
  }

  async send(address: string, ...args: any) {
    logger.info("Sending OSC", address, args);
    await this.osc.send(new OSC.Message(address, ...args), {
      port: 11000,
      host: "localhost",
    });
  }

  async receive(address: string) {
    return new Promise<any>((resolve, reject) => {
      const timeout = setTimeout(() => reject("Timeout"), 1000);
      logger.info("Waiting for OSC", address);
      const unsubscribe = this.osc.on(address, (message: string) => {
        clearTimeout(timeout);
        this.osc.off(address, unsubscribe); // remove listener
        resolve(message); // forward message
        logger.info("Received OSC", address, message);
      });
    });
  }

  async sendAndReturn(address: string, ...args: any) {
    await this.send(address, ...args);
    const msg = await this.receive(address);
    return msg;
  }
}
