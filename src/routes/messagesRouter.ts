import express from 'express';
import chatBotController from '~/controllers/ChatBotController';
const messagesRouter = express.Router();

messagesRouter.post('/chat-messages', chatBotController.chatMessages);
messagesRouter.get('/get-Conversation', chatBotController.getConversationByUser);
messagesRouter.get('/get-history', chatBotController.getListChatByUser);
messagesRouter.get('/get-all-history', chatBotController.getAllListChat);
messagesRouter.get('/get-all-history-user', chatBotController.getConversationByUserAndByName);
export default messagesRouter;
