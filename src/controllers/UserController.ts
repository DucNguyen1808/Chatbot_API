import { NextFunction, Response } from 'express';
import User from '~/models/User';
import AuthenticatedRequest from '~/types/AuthenticatedRequest';

class UserController {
  async getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = await User.findById(req.user?.id);
      res.status(200).json(user);
    } catch (err) {
      next(err);
    }
  }
  async getAllProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = await User.find();
      res.status(200).json(user);
    } catch (err) {
      next(err);
    }
  }
}

const userController = new UserController();
export default userController;
