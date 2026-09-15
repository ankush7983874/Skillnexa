import { Request } from 'express';
import { AuditLog } from '../models/AuditLog';

interface AuditOptions {
  userId?: any;
  role?: string;
  action: string;
  result?: 'SUCCESS' | 'FAILURE';
  resourceId?: string;
  metadata?: Record<string, any>;
  req?: Request;
}

export const auditService = {
  log: async (opts: AuditOptions) => {
    try {
      const ipAddress = opts.req ? (opts.req.headers['x-forwarded-for'] as string) || opts.req.socket.remoteAddress || '' : '';
      const userAgent = opts.req ? opts.req.headers['user-agent'] || '' : '';
      const user = opts.userId || (opts.req as any)?.user?._id;
      const role = opts.role || (opts.req as any)?.user?.role || 'GUEST';

      await AuditLog.create({
        user,
        role,
        action: opts.action,
        result: opts.result || 'SUCCESS',
        ipAddress,
        userAgent,
        resourceId: opts.resourceId || '',
        metadata: opts.metadata || {},
        timestamp: new Date(),
      });
    } catch (err) {
      console.error('Audit logging failed:', err);
    }
  },
};
