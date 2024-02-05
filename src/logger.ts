import MaxAPI from "max-api";

export class Logger {
  info(...args: any[]) {
    console.info(...args);
    MaxAPI.post(...args, MaxAPI.POST_LEVELS.INFO);
  }
  error(...args: any[]) {
    console.error(...args);
    MaxAPI.post(...args, MaxAPI.POST_LEVELS.ERROR);
  }
  warn(...args: any[]) {
    console.warn(...args);
    MaxAPI.post(...args, MaxAPI.POST_LEVELS.WARN);
  }
}

export const logger = new Logger();
