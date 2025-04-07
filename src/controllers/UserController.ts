import { NextFunction, Response } from 'express';
import User from '~/models/User';
import AuthenticatedRequest from '~/types/AuthenticatedRequest';
import { getTimeFilter } from '~/utils/getTimeFilter';
import { z } from 'zod';
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
      let items;
      const query = req.query;
      const q = query.q || '';
      const { timeFilter } = req.query as { timeFilter?: string };
      const filter = getTimeFilter(timeFilter || '');
      const { sortBy = 'createdAt', order = 'desc' } = req.query;
      const sortOrder = order === 'asc' ? 1 : -1;

      const page = parseInt(query.page as string) || 1;
      const limit = parseInt(query.limit as string) || 10;
      const totalItems = await User.countDocuments();
      const totalPages = Math.ceil(totalItems / limit);
      if (q != '') {
        items = await User.find({ name: { $regex: q, $options: 'i' } }).sort({
          [sortBy.toString()]: sortOrder
        });
      } else {
        items = await User.find(filter)
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
    } catch (err) {
      next(err);
    }
  }
  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.query.id;
      if (!id) {
        res.status(400).json({ mesages: 'id is required' });
        return;
      }
      const user = await User.findByIdAndDelete(id);
      if (!user) {
        res.status(404).json({ mesages: 'user not exist' });
        return;
      }
      res.status(200).json({});
    } catch (err) {
      next(err);
    }
  }

  async updateRole(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.query.id;
      const role = req.body.role;
      const roleSchema = z.object({ role: z.enum(['admin', 'user']) });
      const { error } = roleSchema.safeParse({ role });
      if (error) {
        next(error);
      }
      if (!id) {
        res.status(400).json({ mesages: 'id is required' });
        return;
      }
      const user = await User.findById(id);
      if (!user) {
        res.status(404).json({ mesages: 'user not exist' });
        return;
      }
      if (user.role === role) {
        res.status(400).json({ mesages: 'role is same' });
        return;
      }
      user.role = role;
      await user.save();
      res.status(200).json({ data: user });
      return;
    } catch (err) {
      next(err);
    }
  }

  async blockAccount(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.query.id;
      const block = req.body.block;
      const blockSchema = z.object({ block: z.boolean() });
      const { error } = blockSchema.safeParse({ block });
      if (error) {
        next(error);
      }
      if (!id) {
        res.status(400).json({ mesages: 'id is required' });
        return;
      }
      const user = await User.findById(id);
      if (!user) {
        res.status(404).json({ mesages: 'user not exist' });
        return;
      }

      user.state = block;
      await user.save();
      res.status(200).json({ data: user });
      return;
    } catch (err) {
      next(err);
    }
  }
  async changePassword(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.query.id;
      const newPassword = req.body.newPassword;
      const oldPassword = req.body.oldPassword;
      const passwordSchema = z.object({ newPassword: z.string().min(8), oldPassword: z.string().min(8) });
      const { error } = passwordSchema.safeParse({ newPassword, oldPassword });
      if (error) {
        next(error);
      }
      if (!id) {
        res.status(400).json({ mesages: 'id is required' });
        return;
      }
      const user = await User.findById(id);
      if (!user) {
        res.status(404).json({ mesages: 'user not exist' });
        return;
      }
      const isMatch = await user.checkPassword(oldPassword);
      if (isMatch) {
        user.password = newPassword;
        await user.save();
      } else {
        res.status(400).json({ mesages: 'Mật khẩu cũ không đúng' });
        return;
      }
      res.status(200).json({ data: user });
      return;
    } catch (err) {
      next(err);
    }
  }

  async updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.user?.id;
      if (!id) {
        res.status(400).json({ mesages: 'id is required' });
        return;
      }

      const { name } = req.body;
      const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';

      const schema = z.object({
        name: z.string().min(3).optional(),
        avatar: z.string().optional()
      });

      const { error } = schema.safeParse({ name, avatar: imageUrl });
      if (error) {
        next(error);
        return;
      }

      const user = await User.findById(id);
      if (!user) {
        res.status(404).json({ mesages: 'user not exist' });
        return;
      }

      if (name) {
        user.name = name;
      }
      if (imageUrl) {
        user.avatar = imageUrl;
      }

      await user.save();
      res.status(200).json({ data: user });
    } catch (err) {
      next(err);
    }
  }
}

const userController = new UserController();
export default userController;
