import OSC from 'osc-js';

export class Ableton {
    private osc = new OSC({ plugin: new OSC.DatagramPlugin() });

    constructor() {
        this.osc.open({ port: 11001, host: "0.0.0.0" });
    }

    async send(address: string, message: string = "") {
        this.osc.send(new OSC.Message(address, message), { port: 11000, host: "127.0.0.1"  });
    }

    async receive(address: string) {
        return new Promise<string>((resolve, reject) => {
            const timeout = setTimeout(() => reject("Timeout"), 1000);
            const unsubscribe = this.osc.on(address, (message: string) => {
                clearTimeout(timeout); 
                this.osc.off(address, unsubscribe); // remove listener
                resolve(message); // forward message
            });
        });
    }

    async test() {
        const addr = "/live/test";
        await this.send(addr);
        const msg = await this.receive(addr);
        return msg;
    }
}