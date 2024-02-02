import MaxAPI from "max-api";

export class Logger {
    info(...args: string[]) {
        console.info(...args);
        MaxAPI.post(...args, MaxAPI.POST_LEVELS.INFO);
    }
    error(...args: string[]) {
        console.error(...args);
        MaxAPI.post(...args, MaxAPI.POST_LEVELS.ERROR);
    }
    warn(...args: string[]) {
        console.warn(...args);
        MaxAPI.post(...args, MaxAPI.POST_LEVELS.WARN);
    }
}