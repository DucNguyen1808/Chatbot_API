import { NextFunction, Response } from 'express';
import Prompt from '~/models/Prompt';
import AuthenticatedRequest from '~/types/AuthenticatedRequest';
import { getTimeFilter } from '~/utils/getTimeFilter';
import { PromptsChema } from '~/validations/promptValidate';

class PromptController {
  async index(req: AuthenticatedRequest, res: Response, next: NextFunction) {
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
      const totalItems = await Prompt.countDocuments();
      const totalPages = Math.ceil(totalItems / limit);
      if (q != '') {
        items = await Prompt.find({ content: { $regex: q, $options: 'i' } }).sort({
          [sortBy.toString()]: sortOrder
        });
      } else if (limit == -1) {
        items = await Prompt.find();
      } else {
        items = await Prompt.find(filter)
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
  async show(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id;
      const prompt = await Prompt.findById(id);
      if (!prompt) {
        res.status(404).json({ mesages: 'Prompt not exist' });
        return;
      }
      res.status(200).json({ data: prompt });
    } catch (err) {
      next(err);
    }
  }
  async store(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = req.body;
      if (!PromptsChema.safeParse(data).success) {
        next(PromptsChema.safeParse(data).error);
        return;
      }
      const prompt = new Prompt(data);
      prompt.save();
      res.status(201).json(prompt);
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
      const prompt = await Prompt.findByIdAndDelete(id);
      if (!prompt) {
        res.status(404).json({ mesages: 'Prompt not exist' });
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
      if (!id) {
        res.status(400).json({ mesages: 'id is required' });
        return;
      }
      if (!PromptsChema.safeParse(data).success) {
        next(PromptsChema.safeParse(data).error);
        return;
      }
      const prompt = await Prompt.findById(id);
      if (!prompt) {
        res.status(404).json({ mesages: 'Prompt not exist' });
        return;
      }
      prompt.title = data.title;
      prompt.content = data.content;
      prompt.save();
      res.status(201).json(prompt);
    } catch (err) {
      next(err);
    }
  }
}

const promptController = new PromptController();
export default promptController;
