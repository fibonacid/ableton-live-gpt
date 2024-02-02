import MaxAPI from 'max-api';
import { Ableton } from './ableton';
import { Logger } from './logger';

const logger = new Logger();
logger.info('Hello from Node');

const ableton = new Ableton({
    logger
});

MaxAPI.addHandlers({
 test() {
    logger.info('handling test command...');
    ableton.test().then((msg) => {
        logger.info(msg);
    }).catch((err: string) => {
        logger.error(err)
    });
 },
})

