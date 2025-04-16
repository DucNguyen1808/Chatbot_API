import { NextFunction, Request, Response } from 'express';
import AuthenticatedRequest from '~/types/AuthenticatedRequest';
import { createSupportSchema, replySupportSchema } from '~/validations/support';
import Support from '~/models/Support';
import User from '~/models/User';
import mongoose from 'mongoose';
import { getTimeFilter } from '~/utils/getTimeFilter';

class PromptController {
  async reqSupport(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';
    req.body.attachment = imageUrl;
    const parseResult = createSupportSchema.safeParse(req.body);

    if (!parseResult.success) {
      next(parseResult.error);
      return;
    }

    const { subject, message, attachment, priority, user_id, category } = parseResult.data;
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
        attachment,
        category,
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
    const query = req.query;
    const q = query.q || '';
    const page = parseInt(query.page as string) || 1;
    const limit = parseInt(query.limit as string) || 10;
    const totalItems = await Support.countDocuments({ user_id: id });
    const totalPages = Math.ceil(totalItems / limit);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: 'Invalid user ID' });
      return;
    }
    let supports;
    try {
      if (q == '') {
        supports = await Support.find({ user_id: id })
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit);
      } else {
        supports = await Support.find({ subject: { $regex: q, $options: 'i' } });
      }
      res.status(200).json({ data: supports, page, limit, totalPages, totalItems });
      return;
    } catch (error) {
      next(error);
    }
  }
  async index(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query;
      const q = query.q || '';
      const { timeFilter } = req.query as { timeFilter?: string };
      const filter = getTimeFilter(timeFilter || '');
      const { sortBy = 'createdAt', order = 'desc' } = req.query;
      const sortOrder = order === 'asc' ? 1 : -1;
      let items;

      const page = parseInt(query.page as string) || 1;
      const limit = parseInt(query.limit as string) || 10;
      const totalItems = await Support.countDocuments();
      const totalPages = Math.ceil(totalItems / limit);
      if (q != '') {
        items = await Support.find({
          $or: [{ message: { $regex: q, $options: 'i' } }, { subject: { $regex: q, $options: 'i' } }]
        }).sort({
          [sortBy.toString()]: sortOrder
        });
      } else if (limit == -1) {
        items = await Support.find();
      } else {
        items = await Support.find(filter)
          .sort({ [sortBy.toString()]: sortOrder })
          .skip((page - 1) * limit)
          .limit(limit);
      }

      res.status(200).json({
        page,
        limit,
        totalPages,
        totalItems,
        data: items
      });
      return;
    } catch (err) {
      next(err);
    }
  }
  async delete(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: 'Invalid support ID' });
      return;
    }

    try {
      const deleted = await Support.findByIdAndDelete(id);

      if (!deleted) {
        res.status(404).json({ message: 'Support request not found' });
        return;
      }

      res.status(200).json({ message: 'Support request deleted successfully' });
      return;
    } catch (error) {
      next(error);
    }
  }
}

const promptController = new PromptController();
export default promptController;
