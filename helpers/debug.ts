const DEBUG = process.env.NODE_ENV !== "production";
const debugPrefix = "[Survser]";

export const debug = {
  log: (...args: any[]) => {
    if (DEBUG) console.log(debugPrefix, ...args);
  },
  warn: (...args: any[]) => {
    if (DEBUG) console.warn(debugPrefix, ...args);
  },
  error: (...args: any[]) => {
    // Always log errors, even in production
    console.error(debugPrefix, ...args);
  },
  trace: (...args: any[]) => {
    if (DEBUG) {
      console.log(debugPrefix, ...args, new Error().stack);
    }
  },
};
