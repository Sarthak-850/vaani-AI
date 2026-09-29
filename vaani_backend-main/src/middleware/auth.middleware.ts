import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../utils/jwt';
import { prisma } from '../config/database';

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Authentication token missing or invalid',
        code: 'UNAUTHORIZED'
      });
      return;
    }

    const decoded = verifyToken(token);

    // Verify user still exists in database and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { ashaWorker: true }
    });

    if (!user || !user.active) {
      res.status(401).json({
        success: false,
        message: 'User account is inactive or no longer exists',
        code: 'USER_INACTIVE'
      });
      return;
    }

    req.user = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      workerId: user.ashaWorker?.id,
      villageId: user.ashaWorker?.villageId
    };

    next();
  } catch (error: any) {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token',
      code: 'INVALID_TOKEN'
    });
  }
};
