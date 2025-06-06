import { NextFunction, Response } from 'express';
import Iframe from '~/models/Iframe';
import AuthenticatedRequest from '~/types/AuthenticatedRequest';

class IframeController {
  async index(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      // let items;
      // const query = req.query;
      // const q = query.q || '';
      // const { timeFilter } = req.query as { timeFilter?: string };
      // const filter = getTimeFilter(timeFilter || '');
      // const { sortBy = 'createdAt', order = 'desc' } = req.query;
      // const sortOrder = order === 'asc' ? 1 : -1;

      // const page = parseInt(query.page as string) || 1;
      // const limit = parseInt(query.limit as string) || 10;
      // const totalItems = await Iframe.countDocuments();
      // const totalPages = Math.ceil(totalItems / limit);
      // if (q != '') {
      //   items = await Iframe.find({ content: { $regex: q, $options: 'i' } }).sort({
      //     [sortBy.toString()]: sortOrder
      //   });
      // } else {
      //   items = await Iframe.find(filter)
      //     .sort({ [sortBy.toString()]: sortOrder })
      //     .skip((page - 1) * limit)
      //     .limit(limit);
      // }
      const items = await Iframe.find();
      res.status(200).json({
        // page,
        // limit,
        // totalPages,
        // totalItems,
        data: items
      });
      return;
    } catch (err) {
      next(err);
    }
  }
  async show(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const prompt = await Iframe.findOne();
      if (!prompt) {
        res.status(404).json({ mesages: 'Iframe not exist' });
        return;
      }
      console.log(prompt);
      res.status(200).json({ data: prompt });
    } catch (err) {
      next(err);
    }
  }
  async store(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = req.body;
      const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
      data.icon = imageUrl;
      const iframe = new Iframe(data);
      iframe.save();
      res.status(201).json(iframe);
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
      const prompt = await Iframe.findByIdAndDelete(id);
      if (!prompt) {
        res.status(404).json({ mesages: 'Iframe not exist' });
        return;
      }

      res.status(200).json({});
    } catch (err) {
      next(err);
    }
  }
  async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = req.body;
      const id = req.query.id;
      const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
      data.icon = imageUrl;
      if (!id) {
        res.status(400).json({ mesages: 'id is required' });
        return;
      }
      const prompt = await Iframe.findByIdAndUpdate(id, data, { new: true });
      if (!prompt) {
        res.status(404).json({ mesages: 'Prompt not exist' });
        return;
      }

      res.status(201).json(prompt);
    } catch (err) {
      next(err);
    }
  }
}

const iframeController = new IframeController();
export default iframeController;
