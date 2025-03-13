import { NextFunction, Response } from 'express';
import Conversation from '~/models/Conversation';
import chatMessagesRes from '~/types/ChatMessagesRes';
import AuthenticatedRequest from '~/types/AuthenticatedRequest';
import http from '~/utils/http';
import User from '~/models/User';
import createHttpError from 'http-errors';
class ChatBotController {
  async chatMessages(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      console.log(req.body.conversation_id);
      const user = await User.findById(req.body.user);
      const result = await http.post<chatMessagesRes>('/chat-messages', {
        // hoten: 'Nhập tên',
        inputs: { hoten: 'ABC' },
        query: req.body.query,
        response_mode: 'blocking',
        files: [],
        conversation_id: req.body.conversation_id,
        user: req.body.user
      });

      const data = result.data;
      const findconversation = await Conversation.findOne({ conversation_id: data.conversation_id });
      console.log(findconversation);
      if (!findconversation) {
        const conversation = new Conversation({
          conversation_id: data.conversation_id,
          user_id: user?._id,
          bot_id: '1234',
          mesagess: [{ query: req.body.query, answer: data.answer, feedback: { content: '12', state: true } }],
          name: req.body.query
        });

        await conversation.save();
        user?.conversation.push(conversation._id);
        await user?.save();
        res
          .status(200)
          .json({ data: { conversation_id: conversation.conversation_id, mesagess: conversation.mesagess.at(-1) } });
        return;
      }

      findconversation?.mesagess.push({
        query: req.body.query,
        answer: data.answer,
        feedback: { content: '', state: true }
      });
      await findconversation?.save();
      res.status(200).json({
        data: { conversation_id: findconversation.conversation_id, mesagess: findconversation.mesagess.at(-1) }
      });
      return;
    } catch (error) {
      next(error);
    }
  }
  async getConversationByUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      console.log(req.query);
      const user = await User.findById(req.query.user_id).populate('conversation').exec();
      if (!user) {
        next(createHttpError(404, 'User does not exist!'));
        return;
      }
      console.log(user.conversation.length);
      if (!user.conversation.length) {
        res.status(200).json([]);
        return;
      }
      res.status(200).json(user.conversation);
    } catch (error) {
      next(error);
    }
  }
  async getListChatByUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = await User.findById(req.query.user_id);
      console.log(user);
      if (!user) {
        res.status(404).json({ mesages: 'user not exit' });
        return;
      }
      const conversation = await Conversation.findOne({
        conversation_id: req.query.conversation_id,
        user_id: user?._id
      });
      if (!conversation) {
        res.status(404).json({ mesages: 'Conversation not exit' });
        return;
      }
      res.status(200).json(conversation);
    } catch (error) {
      next(error);
    }
  }
  async getAllListChat(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      let conversation = [];
      if (req.query.q) {
        conversation = await Conversation.find({ name: { $regex: req.query.q, $options: 'i' } })
          .limit(10)
          .populate('user_id');
      } else {
        conversation = await Conversation.find().limit(10).populate('user_id');
      }

      if (conversation.length === 0) {
        res.status(200).json([]);
        return;
      }

      res.status(200).json(conversation);
      return;
    } catch (error) {
      next(error);
    }
  }
  async getConversationByUserAndByName(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      console.log(req.query);
      const conversation = await Conversation.find({
        user_id: req.query.user_id,
        name: { $regex: req.query.q, $options: 'i' }
      });
      if (!conversation) {
        res.status(200).json([]);
        return;
      }
      res.status(200).json(conversation);
    } catch (error) {
      next(error);
    }
  }
}

const chatBotController = new ChatBotController();
export default chatBotController;
