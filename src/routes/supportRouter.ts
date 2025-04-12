import express from 'express';
import supportController from '~/controllers/SupportController';
import checkAdmin from '~/middlewares/checkAdmin';
import { verifyAccsesToken } from '~/utils/jwt';

const suportRouter = express.Router();

suportRouter.post('/', supportController.reqSupport);
suportRouter.patch('/:id/reply', supportController.reply);
suportRouter.get('/user/:id/', supportController.supportByUser);
suportRouter.get('/', supportController.index);

export default suportRouter;
