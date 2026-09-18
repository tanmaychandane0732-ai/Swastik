import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authService } from '../services/authService';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export const registerSchema = z.object({
  name: z.string().min(2, 'Pilot name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const guestSchema = z.object({
  pilotCallsign: z.string().optional(),
});

export class AuthController {
  public static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, email, password } = req.body;
      const result = await authService.register(name, email, password);
      res.status(201).json({
        success: true,
        message: 'Pilot flight credentials registered successfully.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      res.status(200).json({
        success: true,
        message: 'Pilot authorization granted.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async guest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { pilotCallsign } = req.body;
      const result = await authService.createGuestSession(pilotCallsign);
      res.status(200).json({
        success: true,
        message: 'Instant guest flight pass issued.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async me(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized pilot.' });
        return;
      }
      const user = await authService.getProfile(req.user.userId);
      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }
}

