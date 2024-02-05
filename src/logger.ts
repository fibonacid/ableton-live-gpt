import MaxAPI from "max-api";
import { stringify } from "querystring";
import { string } from "zod";

export class Logger {
  private stringify(args: any[]) {
    return args.map((a) => JSON.stringify(a));
  }
  info(...args: any[]) {
    console.info(...args);
    MaxAPI.post(...this.stringify(args), MaxAPI.POST_LEVELS.INFO);
  }
  error(...args: any[]) {
    console.error(...args);
    MaxAPI.post(...this.stringify(args), MaxAPI.POST_LEVELS.ERROR);
  }
  warn(...args: any[]) {
    console.warn(...args);
    MaxAPI.post(...this.stringify(args), MaxAPI.POST_LEVELS.WARN);
  }
}

export const logger = new Logger();
