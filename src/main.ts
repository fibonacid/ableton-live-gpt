import MaxAPI from 'max-api';
import { Client, Server } from "node-osc";
import { Ableton } from './ableton';

MaxAPI.post('Hello from TypeScript');

const ableton = new Ableton();

MaxAPI.addHandlers({
 test() {
    MaxAPI.post('Testing Ableton');
    ableton.test().catch((err: unknown) => {
        if (err instanceof Error) {
            MaxAPI.post(err.message, MaxAPI.POST_LEVELS.ERROR);
        }
    });
 },
})