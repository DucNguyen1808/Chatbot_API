import { NextFunction, Request, Response } from 'express';
import AuthenticatedRequest from '~/types/AuthenticatedRequest';
import { createSupportSchema, replySupportSchema } from '~/validations/support';
import Support from '~/models/Support';
import User from '~/models/User';
import mongoose from 'mongoose';

class PromptController {
  async reqSupport(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const parseResult = createSupportSchema.safeParse(req.body);

    if (!parseResult.success) {
      next(parseResult.error);
      return;
    }

    const { subject, message, attachments, priority, user_id } = parseResult.data;
    if (!mongoose.Types.ObjectId.isValid(user_id)) {
      res.status(400).json({ message: 'Invalid user ID' });
      return;
    }
    const user = await User.findOne({ _id: user_id });
    if (!user) {
      res.status(404).json({ message: 'user not exit' });
      return;
    }

    try {
      const support = await Support.create({
        subject,
        message,
        user_id,
        attachments,
        priority: parseInt(priority ?? '2') // fallback to 2 if undefined
      });

      res.status(201).json(support);
      return;
    } catch (error) {
      next(error);
    }
  }
  async reply(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const { id } = req.params;
    const parseResult = replySupportSchema.safeParse(req.body);

    if (!parseResult.success) {
      next(parseResult.error);
      return;
    }

    const { response, status } = parseResult.data;

    try {
      const support = await Support.findById(id);

      if (!support) {
        res.status(404).json({ message: 'Support request not found' });
        return;
      }

      support.response = response;
      if (status) support.status = status;
      else support.status = 'resolved';
      await support.save();
      res.status(200).json(support);
      return;
    } catch (error) {
      next(error);
    }
  }
  async supportByUser(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: 'Invalid user ID' });
      return;
    }

    try {
      const supports = await Support.find({ user_id: id }).sort({ createdAt: -1 });
      res.status(200).json(supports);
      return;
    } catch (error) {
      next(error);
    }
  }
  async index(req: Request, res: Response, next: NextFunction) {
    try {
      const supports = await Support.find().sort({ createdAt: -1 }); // newest first
      res.status(200).json(supports);
      return;
    } catch (error) {
      next(error);
    }
  }
}

const promptController = new PromptController();
export default promptController;
