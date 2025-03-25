import { NextFunction, Response } from 'express';
import User from '~/models/User';
import AuthenticatedRequest from '~/types/AuthenticatedRequest';

const checkAdmin = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const user = await User.findById(req.user?.id);
  if (user?.role !== 'admin') {
    res.status(403).json({ message: 'Bạn không có quyền truy cập' });
    return;
  } else next();
};
export default checkAdmin;
