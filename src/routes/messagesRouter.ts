import express from 'express';
import chatBotController from '~/controllers/ChatBotController';
import checkAdmin from '~/middlewares/checkAdmin';
import { verifyAccsesToken } from '~/utils/jwt';
const messagesRouter = express.Router();
messagesRouter.post('/chat-messages', verifyAccsesToken, chatBotController.chatMessages);
messagesRouter.post('/chat-messages-popup', chatBotController.chatMessagesPopup);
messagesRouter.get('/get-Conversation', verifyAccsesToken, chatBotController.getConversationByUser);
messagesRouter.get('/get-history', verifyAccsesToken, chatBotController.getListChatByUser);
messagesRouter.get('/get-history-Iframe', chatBotController.getListChatByIframe);
messagesRouter.get('/get-all-conversation', verifyAccsesToken, checkAdmin, chatBotController.getConversation);
messagesRouter.get(
  '/get-all-history-user',
  verifyAccsesToken,
  checkAdmin,
  chatBotController.getConversationByUserAndByName
);
messagesRouter.get('/statistical', verifyAccsesToken, checkAdmin, chatBotController.statistical);

messagesRouter.get('/getHistory', verifyAccsesToken, checkAdmin, chatBotController.getChatHistory);
messagesRouter.get('/export-excel', verifyAccsesToken, checkAdmin, chatBotController.exportExcel);

messagesRouter.patch('/feedback', verifyAccsesToken, chatBotController.feedback);
messagesRouter.delete('/conversation/:id', verifyAccsesToken, chatBotController.delete);
messagesRouter.patch('/conversation/store/:id', verifyAccsesToken, chatBotController.store);
messagesRouter.patch('/conversation/rename/:id', verifyAccsesToken, chatBotController.reName);
export default messagesRouter;
