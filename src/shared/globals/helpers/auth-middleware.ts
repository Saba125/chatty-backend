import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '@root/config';
import { NotAuthorized } from './error-handler';
import { AuthPayload } from '@auth/interfaces/auth.interface';
export class AuthMiddleware {
  public verifyUser(req: Request, _res: Response, next: NextFunction): void {
    if (!req.session?.jwt) {
      throw new NotAuthorized('Token is not available.Please log in again');
    }
    try {
      const payload: AuthPayload = jwt.verify(req.session.jwt, config.JWT_TOKEN!) as AuthPayload;
      req.currentUser = payload;
    } catch (_err: unknown) {
      throw new NotAuthorized('Token is not invalid.Please log in again');
    }
    next();
  }
  public checkAuthentication(req: Request, _res: Response, next: NextFunction): void {
    if (!req.currentUser) {
      throw new NotAuthorized('Authentication is required to access this route.');
    }
    next();
  }
}
export const authMiddleware: AuthMiddleware = new AuthMiddleware();
