const timestamp = () => new Date().toISOString();

const logger = {
  info: (msg) => console.log(`[INFO] ${timestamp()} — ${msg}`),
  error: (msg, err = null) => {
    if (err) {
      console.error(`[ERROR] ${timestamp()} — ${msg}`, err);
    } else {
      console.error(`[ERROR] ${timestamp()} — ${msg}`);
    }
  },
  warn: (msg) => console.warn(`[WARN] ${timestamp()} — ${msg}`),
  debug: (msg) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[DEBUG] ${timestamp()} — ${msg}`);
    }
  }
};

export default logger;
