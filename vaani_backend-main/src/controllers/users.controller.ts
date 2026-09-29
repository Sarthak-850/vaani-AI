import { Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export class UsersController {
  public async getAllUsers(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const users = await prisma.user.findMany({
        include: {
          ashaWorker: {
            include: { village: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      const formatted = users.map((u) => ({
        uid: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        role: u.role.toLowerCase(),
        village: u.ashaWorker?.village.name || 'District HQ',
        district: u.ashaWorker?.village.district || 'Varanasi',
        state: u.ashaWorker?.village.state || 'Uttar Pradesh',
        profilePhoto: u.profilePhoto,
        active: u.active,
        createdAt: u.createdAt.toISOString()
      }));

      res.status(200).json({ success: true, users: formatted });
    } catch (err) {
      next(err);
    }
  }

  public async getUserById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const user = await prisma.user.findUnique({
        where: { id },
        include: { ashaWorker: { include: { village: true } } }
      });

      if (!user) {
        res.status(404).json({ success: false, message: 'User not found', code: 'USER_NOT_FOUND' });
        return;
      }

      res.status(200).json({
        success: true,
        user: {
          uid: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role.toLowerCase(),
          village: user.ashaWorker?.village.name || 'District HQ',
          district: user.ashaWorker?.village.district || 'Varanasi',
          state: user.ashaWorker?.village.state || 'Uttar Pradesh',
          profilePhoto: user.profilePhoto,
          active: user.active
        }
      });
    } catch (err) {
      next(err);
    }
  }

  public async updateUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { name, phone, profilePhoto, active } = req.body;

      const updated = await prisma.user.update({
        where: { id },
        data: {
          name,
          phone,
          profilePhoto,
          active
        }
      });

      res.status(200).json({ success: true, message: 'User updated', user: updated });
    } catch (err) {
      next(err);
    }
  }

  public async getWorkers(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const workers = await prisma.aSHAWorker.findMany({
        include: {
          user: true,
          village: true,
          _count: { select: { visits: true, incentives: true } }
        },
        orderBy: { createdAt: 'desc' }
      });

      const formatted = workers.map((w) => ({
        id: w.id,
        userId: w.userId,
        name: w.user.name,
        email: w.user.email,
        phone: w.user.phone,
        village: w.village.name,
        district: w.village.district,
        state: w.village.state,
        totalVisits: w._count.visits,
        active: w.active,
        createdAt: w.createdAt.toISOString()
      }));

      res.status(200).json({ success: true, workers: formatted });
    } catch (err) {
      next(err);
    }
  }

  public async getWorkerById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const worker = await prisma.aSHAWorker.findUnique({
        where: { id },
        include: { user: true, village: true }
      });

      if (!worker) {
        res.status(404).json({ success: false, message: 'Worker not found', code: 'WORKER_NOT_FOUND' });
        return;
      }

      res.status(200).json({ success: true, worker });
    } catch (err) {
      next(err);
    }
  }
}

export const usersController = new UsersController();
