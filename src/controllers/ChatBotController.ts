import { NextFunction, Response } from 'express';
import Conversation from '~/models/Conversation';
import chatMessagesRes from '~/types/ChatMessagesRes';
import AuthenticatedRequest from '~/types/AuthenticatedRequest';
import http from '~/utils/http';
import User from '~/models/User';
import createHttpError from 'http-errors';
import ExcelJS from 'exceljs';
import { console } from 'inspector';
import { getTimeFilter } from '~/utils/getTimeFilter';
import Setting from '~/models/Setting';
import Iframe from '~/models/Iframe';

function regulations(content: string) {
  return `<HEAD>
Quy tắc:
- Định dạng câu trả lời bằng **Markdown**.
- Link phải dùng cú pháp: [tên](https://link), ví dụ: [OpenAI](https://openai.com)
- Dùng tiêu đề với dấu \`#\`, danh sách \`-\` hoặc \`1.\`, và đoạn văn rõ ràng.
- Nếu có code, đặt trong khối \`\`\` ngôn ngữ \`\`\`.
- Các công thức toán học phải được viết bằng cú pháp LaTeX:
  + Công thức inline: dùng \`$...$\`, ví dụ: $E = mc^2$
  + Công thức khối: dùng \`$$...$$\`, ví dụ:
    $$
    \\int_a^b f(x)\\,dx = F(b) - F(a)
    $$  
</HEAD>
<CONTENT>${content}</CONTENT>`;
}
class ChatBotController {
  async chatMessages(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      console.log(req.body.conversation_id);
      const setting = await Setting.find();
      if (setting.length < 0) {
        next(createHttpError[403]('Không có apikey'));
        return;
      }
      const apiKey = setting[0].api_key;
      const user = await User.findById(req.body.user);
      const result = await http.post<chatMessagesRes>(
        '/chat-messages',
        {
          // hoten: 'Nhập tên',
          inputs: { hoten: 'ABC' },
          query: regulations(req.body.query),
          response_mode: 'blocking',
          files: [],
          conversation_id: req.body.conversation_id,
          user: req.body.user
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`
          }
        }
      );

      const data = result.data;
      const findconversation = await Conversation.findOne({ conversation_id: data.conversation_id });
      console.log(findconversation);
      if (!findconversation) {
        const conversation = new Conversation({
          conversation_id: data.conversation_id,
          user_id: user?._id,
          bot_id: '1234',
          mesagess: [{ query: req.body.query, answer: data.answer }],
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
        answer: data.answer
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

  async chatMessagesPopup(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      console.log(req.body.conversation_id);
      const setting = await Setting.find();
      if (setting.length < 0) {
        next(createHttpError[403]('Không có apikey'));
        return;
      }
      const apiKey = setting[0].api_key;

      const result = await http.post<chatMessagesRes>(
        '/chat-messages',
        {
          // hoten: 'Nhập tên',
          inputs: { hoten: 'ABC' },
          query: regulations(req.body.query),
          response_mode: 'blocking',
          files: [],
          conversation_id: req.body.conversation_id,
          user: req.body.user
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`
          }
        }
      );

      const data = result.data;
      const findconversation = await Conversation.findOne({ conversation_id: data.conversation_id });
      console.log(findconversation);
      if (!findconversation) {
        const conversation = new Conversation({
          conversation_id: data.conversation_id,

          bot_id: '1234',

          mesagess: [{ query: req.body.query, answer: data.answer }],
          name: req.body.query,
          iframe: true
        });

        await conversation.save();

        res
          .status(200)
          .json({ data: { conversation_id: conversation.conversation_id, mesagess: conversation.mesagess.at(-1) } });
        return;
      }

      findconversation?.mesagess.push({
        query: req.body.query,
        answer: data.answer
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
      console.log(req.query.q);
      const q = req.query.q as string;
      const user = await User.findById(req.query.user_id).populate({
        path: 'conversation',
        match: q ? { name: new RegExp(q, 'i') } : undefined // Tìm kiếm theo name nếu có
      });

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

  async getListChatByIframe(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const conversation = await Conversation.findOne({
        conversation_id: req.query.conversation_id,
        iframe: true
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

  async getConversation(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const query = req.query;
      // let page = query.page || 1;
      // let limit = query.limit || 10;
      const q = query.q || '';
      const { timeFilter } = req.query as { timeFilter?: string };
      const filter = getTimeFilter(timeFilter || '');
      const { sortBy = 'createdAt', order = 'desc' } = req.query;
      const sortOrder = order === 'asc' ? 1 : -1;
      let items;

      const page = parseInt(query.page as string) || 1;
      const limit = parseInt(query.limit as string) || 10;
      const totalItems = await Conversation.countDocuments();
      const totalPages = Math.ceil(totalItems / limit);

      if (q != '') {
        items = await Conversation.find({ name: { $regex: `.*${q}.*`, $options: 'i' } })
          .sort({ [sortBy.toString()]: sortOrder })
          .populate('user_id');
      } else {
        items = await Conversation.find(filter)
          .populate('user_id')
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
  async getChatHistory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const conversation = await Conversation.findOne({
        conversation_id: req.query.conversation_id
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
  async exportExcel(req: AuthenticatedRequest, res: Response) {
    try {
      const conversations = await Conversation.find().populate('user_id').lean();

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Conversations');

      // Định nghĩa tiêu đề cột
      worksheet.columns = [
        { header: 'ID cuộc trò truyện', key: 'conversation_id', width: 40 },
        { header: 'Tên người dùng', key: 'user_id', width: 25 },
        { header: 'Email', key: 'email', width: 25 },
        { header: 'Câu hỏi của user', key: 'query', width: 30 },
        { header: 'Câu trả lời của chatbot', key: 'answer', width: 50 },
        { header: 'Đánh giá câu trả lời', key: 'feedback_state', width: 15 },
        { header: 'Nội dung đánh giá', key: 'feedback_content', width: 15 },
        { header: 'Ngày tạo', key: 'createdAt', width: 25 }
      ];

      await conversations.forEach(async (conversation) => {
        const startRow = worksheet.rowCount + 1;
        worksheet.mergeCells(`A${startRow}:H${startRow}`);
        const titleRow = worksheet.getRow(startRow);
        titleRow.getCell(1).value = `Tóm tắt: ${conversation.name}`;
        titleRow.font = { bold: true, color: { argb: 'FFFFFF' } };
        titleRow.alignment = { horizontal: 'center' };
        titleRow.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: '4F81BD' }
        };

        (conversation.mesagess || []).forEach((msg, index) => {
          let cvs_id = '';
          let userName = '';
          let email = '';
          if (index == 0) {
            cvs_id = conversation.conversation_id || '';
            if (conversation.user_id) {
              userName = conversation.user_id.name?.toString();
              email = conversation.user_id.email?.toString();
            } else {
              userName = 'Iframe';
              email = '';
            }
          }
          worksheet.addRow({
            conversation_id: cvs_id,
            user_id: userName,
            query: msg.query,
            answer: msg.answer,
            email: email,
            feedback_state: msg.feedback?.state ? '✅' : '❌',
            feedback_content: msg.feedback?.content || '',
            createdAt: new Date(msg.createdAt).toLocaleString()
          });
        });

        worksheet.addRow({});
      });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=conversations.xlsx');

      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      console.error('Lỗi xuất file Excel:', error);
      res.status(500).send('Lỗi khi tạo file Excel');
    }
  }
  async feedback(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const { conversationId, messageId, state, content } = req.body;
    try {
      const updatedConversation = await Conversation.findOne({ conversation_id: conversationId }).then(
        (conversation) => {
          const message = conversation?.mesagess.id(messageId);
          if (!message) {
            return null;
          }
          message.feedback = { state, content };
          return conversation?.save();
        }
      );

      if (!updatedConversation) {
        res.status(404).json({ message: 'Không tìm thấy hội thoại hoặc tin nhắn' });
        return;
      }

      res.status(200).json({ message: 'Cập nhật thành công', updatedConversation });
      return;
    } catch (error) {
      next(error);
    }
  }
  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const { id } = req.params;
    console.log(id);
    try {
      const deletedConversation = await Conversation.findOneAndDelete({ conversation_id: id });
      if (!deletedConversation) {
        res.status(404).json({ message: 'Không tìm thấy hội thoại' });
        return;
      }
      res.status(200).json({});
    } catch (error) {
      next(error);
    }
  }
  async store(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const { id } = req.params;
    const state = req.body.state;
    try {
      const storeConversation = await Conversation.findOne({ conversation_id: id });
      if (!storeConversation) {
        res.status(404).json({ message: 'Không tìm thấy hội thoại' });
        return;
      }
      storeConversation.store = state;
      storeConversation.save();
      res.status(200).json({ data: storeConversation });
    } catch (error) {
      next(error);
    }
  }
  async reName(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const { id } = req.params;
    const name = req.body.name;
    try {
      const storeConversation = await Conversation.findOne({ conversation_id: id });
      if (!storeConversation) {
        res.status(404).json({ message: 'Không tìm thấy hội thoại' });
        return;
      }
      storeConversation.name = name;
      storeConversation.save();
      res.status(200).json({ data: storeConversation });
    } catch (error) {
      next(error);
    }
  }
  async statistical(req: AuthenticatedRequest, res: Response) {
    const now = new Date();
    const lastYear = new Date();
    lastYear.setFullYear(now.getFullYear() - 1);

    const stats = await Conversation.aggregate([
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
}
const chatBotController = new ChatBotController();
export default chatBotController;
