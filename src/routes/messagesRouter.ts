import express from 'express';
import chatBotController from '~/controllers/ChatBotController';
import checkAdmin from '~/middlewares/checkAdmin';
import { verifyAccsesToken } from '~/utils/jwt';
const messagesRouter = express.Router();

messagesRouter.post('/chat-messages', chatBotController.chatMessages);
messagesRouter.get('/get-Conversation', chatBotController.getConversationByUser);
messagesRouter.get('/get-history', chatBotController.getListChatByUser);
messagesRouter.get('/get-all-conversation', chatBotController.getConversation);
messagesRouter.get('/get-all-history-user', chatBotController.getConversationByUserAndByName);

messagesRouter.get('/getHistory', verifyAccsesToken, checkAdmin, chatBotController.getChatHistory);
messagesRouter.get('/export-excel', verifyAccsesToken, checkAdmin, chatBotController.exportExcel);

messagesRouter.patch('/feedback', verifyAccsesToken, chatBotController.feedback);
messagesRouter.delete('/conversation/:id', verifyAccsesToken, chatBotController.delete);
export default messagesRouter;
