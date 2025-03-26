import { NextFunction, Response } from 'express';
import { Mesages } from '~/models/Conversation';
import Prompt from '~/models/Prompt';
import AuthenticatedRequest from '~/types/AuthenticatedRequest';
import { PromptsChema } from '~/validations/promptValidate';

class PromptController {
  async index(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const prompt = await Prompt.find();
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
