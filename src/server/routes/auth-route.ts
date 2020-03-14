import { NextFunction, Request, Response } from 'express';
import { authTokenLookup } from '../models/auth';
import asyncRoute from './async-route';

type AuthHandler = (
  userId: string,
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<any>;

const authRoute = (fn: AuthHandler) =>
  asyncRoute(async (req, res, next) => {
    const auth = req.get('x-pifuxelck-auth');
    const userId = await authTokenLookup(req.db, auth);
    req.context.user = userId;
    await fn(userId, req, res, next);
  });

export default authRoute;
