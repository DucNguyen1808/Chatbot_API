import { NextFunction, Response } from 'express';
import User from '~/models/User';
import AuthenticatedRequest from '~/types/AuthenticatedRequest';
import { getTimeFilter } from '~/utils/getTimeFilter';
import crypto from 'crypto';
import { z } from 'zod';
import sendEmail from '~/utils/sendmail';
import ExcelJS from 'exceljs';
import Conversation from '~/models/Conversation';

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
      const user = await User.findOneAndDelete({ _id: id });

      if (!user) {
        res.status(404).json({ mesages: 'user not exist' });
        return;
      }
      await Conversation.deleteMany({ _id: { $in: user.conversation } });
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
  async forgotPassword(req: AuthenticatedRequest, res: Response) {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Tạo token reset
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Lưu token và hạn dùng
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 phút
    await user.save();

    const resetURL = `http://127.0.0.1:3000/forgot-password/${resetToken}`;
    const message = `Click vào link để đặt lại mật khẩu: \n\n ${resetURL}`;

    try {
      await sendEmail({
        to: user.email,
        subject: 'Yêu cầu đặt lại mật khẩu',
        text: message
      });

      res.json({ message: 'Đã gửi email đặt lại mật khẩu' });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
      res.status(500).json({ message: 'Gửi email thất bại' });
    }
  }

  async resetPassword(req: AuthenticatedRequest, res: Response) {
    const hashedToken = crypto.createHash('sha256').update(req.body.token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    });
    if (!user) {
      res.status(400).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
      return;
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    res.json({ message: 'Mật khẩu đã được cập nhật thành công' });
  }
  async statistical(req: AuthenticatedRequest, res: Response) {
    const now = new Date();
    const lastYear = new Date();
    lastYear.setFullYear(now.getFullYear() - 1);

    const stats = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: lastYear } // 👈 chỉ lấy user 1 năm gần đây
        }
      },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      {
        $sort: {
          '_id.year': 1,
          '_id.month': 1
        }
      }
    ]);
    res.status(200).json({ data: stats });
  }
  exportUsersToExcel = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const users = await User.find().lean();

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Users');

      // Thêm tiêu đề cột
      worksheet.columns = [
        { header: 'STT', key: 'index', width: 6 },
        { header: 'Tên', key: 'name', width: 25 },
        { header: 'Email', key: 'email', width: 30 },
        { header: 'Vai trò', key: 'role', width: 12 },
        { header: 'Ngày tạo', key: 'createdAt', width: 20 }
      ];

      // Ghi dữ liệu
      users.forEach((user, index) => {
        worksheet.addRow({
          index: index + 1,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: new Date(user.createdAt).toLocaleString('vi-VN')
        });
      });

      // Thiết lập header để tải về
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=user.xlsx');

      // Ghi workbook vào response stream
      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      next(error);
    }
  };
}

const userController = new UserController();
export default userController;
