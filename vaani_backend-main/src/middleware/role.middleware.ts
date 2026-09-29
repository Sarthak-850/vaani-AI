import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware';
import { Role } from '@prisma/client';

export const authorizeRoles = (...allowedRoles: Role[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'UNAUTHORIZED'
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Forbidden: role ${req.user.role} does not have access to this resource`,
        code: 'FORBIDDEN_ROLE'
      });
      return;
    }

    next();
  };
};
