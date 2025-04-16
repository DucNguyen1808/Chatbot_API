import express, { NextFunction, Response } from 'express';
import checkAdmin from '~/middlewares/checkAdmin';
import User from '~/models/User';
import Prompt from '~/models/Prompt';
import Conversation from '~/models/Conversation';
import AuthenticatedRequest from '~/types/AuthenticatedRequest';
import { verifyAccsesToken } from '~/utils/jwt';

const StatisticalRouter = express.Router();

StatisticalRouter.get(
  '/thongke/',
  verifyAccsesToken,
  checkAdmin,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const totalUser = await User.countDocuments();
      const totalPrompt = await Prompt.countDocuments();
      const totalConversation = await Conversation.countDocuments();
      res.status(200).json({ totalUser, totalPrompt, totalConversation });
    } catch (error) {
      next(error);
    }
  }
);

export default StatisticalRouter;
