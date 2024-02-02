import { Client, Message, Server } from "node-osc";
import MaxAPI from 'max-api';

export class Ableton {
    private readonly client = new Client("127.0.0.1", 11000);
    private readonly server = new Server(11001, "0.0.0.0");

    constructor() {}

    async send(address: string, message: string = "") {
        this.client.send(new Message(address, message), (err) => {
            console.error(err);
        });
    }

    async receive(address: string) {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => reject("Timeout"), 1000);
            this.server.on('message', (msg, rinfo) => {
                if (rinfo.address === address) {
                    clearTimeout(timeout);
                    MaxAPI.post(`Message: ${msg} from ${rinfo.address}:${rinfo.port}`);
                    resolve(msg);
                }
            });
        });
    }

    async test() {
        const addr = "/live/test";
        await this.send(addr);
        const msg = await this.receive(addr);
        console.log(msg);
    }
}