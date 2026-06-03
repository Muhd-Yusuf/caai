import { Request, Response, NextFunction } from 'express';
import { getClientIp } from '../utils/clientIp';

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  const ip = getClientIp(req);

  res.on('finish', () => {
    const duration = Date.now() - start;
    const log = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip,
    };

    if (res.statusCode >= 400) {
      console.error('[REQ]', JSON.stringify(log));
    } else {
      console.log('[REQ]', JSON.stringify(log));
    }
  });

  next();
}
