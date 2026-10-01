import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { classroomService } from '../services/classroomService';
import { dataRepository } from '../repositories/dataRepository';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { getGuestUserId } from "../utils/guestUser";

export const createClassroomSchema = z.object({
  name: z.string().min(3, 'Classroom squadron name must be at least 3 characters'),
  description: z.string().optional(),
});

export const joinClassroomSchema = z.object({
  code: z.string().min(3, 'Squadron code must be provided'),
});

export class ClassroomController {
  public static async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const instructorId = req.user?.userId || 'inst_default';
      const { name, description } = req.body;

      const classroom = await classroomService.createClassroom(instructorId, name, description);

      res.status(201).json({
        success: true,
        message: 'Flight squadron classroom commissioned.',
        data: classroom,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async join(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId || await getGuestUserId();
      const { code } = req.body;

      const result = await classroomService.joinClassroom(userId, code);

      res.status(200).json({
        success: true,
        message: 'Successfully enlisted in flight squadron.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getSummary(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const summary = await dataRepository.getClassroomCohortSummary();
      res.status(200).json({
        success: true,
        data: summary,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getCohort(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const analytics = await classroomService.getCohortAnalytics(id);

      res.status(200).json({
        success: true,
        data: analytics,
      });
    } catch (error) {
      next(error);
    }
  }
}
