import express from 'express';
import promptController from '~/controllers/PromptController';
import checkAdmin from '~/middlewares/checkAdmin';
import { verifyAccsesToken } from '~/utils/jwt';

const promptRouter = express.Router();

promptRouter.get('/', verifyAccsesToken, promptController.index);
promptRouter.post('/', verifyAccsesToken, checkAdmin, promptController.store);
promptRouter.get('/:id', verifyAccsesToken, checkAdmin, promptController.show);
promptRouter.delete('/', verifyAccsesToken, checkAdmin, promptController.delete);
promptRouter.put('/', verifyAccsesToken, checkAdmin, promptController.update);

export default promptRouter;
