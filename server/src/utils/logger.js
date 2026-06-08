import { requestStore } from './asyncStore.js';

const timestamp = () => new Date().toISOString();

const getRequestContext = () => {
  const req = requestStore.getStore();
  if (req) {
    return {
      requestId: req.id,
      userId: req.user?.id || null,
    };
  }
  return null;
};

const formatMessage = (level, msg) => {
  const ctx = getRequestContext();
  const reqPart = ctx ? ` [reqId=${ctx.requestId}]` : '';
  const userPart = ctx && ctx.userId ? ` [userId=${ctx.userId}]` : '';
  return `[${level}] ${timestamp()}${reqPart}${userPart} — ${msg}`;
};

const logger = {
  info: (msg) => console.log(formatMessage('INFO', msg)),
  error: (msg, err = null) => {
    const formatted = formatMessage('ERROR', msg);
    if (err) {
      console.error(formatted, err);
    } else {
      console.error(formatted);
    }
  },
  warn: (msg) => console.warn(formatMessage('WARN', msg)),
  debug: (msg) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(formatMessage('DEBUG', msg));
    }
  }
};

export default logger;

