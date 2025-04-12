import { NextFunction, Response } from 'express';
import AuthenticatedRequest from '~/types/AuthenticatedRequest';
import Setting from '~/models/Setting';
import z from 'zod';

class SettingController {
  async store(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const schema = z.object({
        apiKey: z.string()
      });
      const { error } = schema.safeParse({ apiKey: req.body.apiKey });
      if (error) {
        next(error);
        return;
      }
      const setting = new Setting({ api_key: req.body.apiKey });
      await setting.save();
      res.status(200).json({ messages: 'tạo api key thành công' });
    } catch (err) {
      next(err);
    }
  }
  async index(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const setting = await Setting.find();

      res.status(200).json({ data: setting[0] });
    } catch (err) {
      next(err);
    }
  }
}

const settingController = new SettingController();
export default settingController;
