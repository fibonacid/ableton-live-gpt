import MaxAPI from 'max-api';
import { Ableton } from './ableton';

MaxAPI.post('Hello from TypeScript');

const ableton = new Ableton();

MaxAPI.addHandlers({
 test() {
    MaxAPI.post('handling test command...');
    ableton.test().then((msg) => {
        MaxAPI.post(msg, MaxAPI.POST_LEVELS.INFO);
    }).catch((err: string) => {
        MaxAPI.post(err, MaxAPI.POST_LEVELS.ERROR)
    });
 },
})