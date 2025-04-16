import express from 'express';
import supportController from '~/controllers/SupportController';
import checkAdmin from '~/middlewares/checkAdmin';
import { upload } from '~/middlewares/uploadImages';
import { verifyAccsesToken } from '~/utils/jwt';

const suportRouter = express.Router();

suportRouter.post('/', verifyAccsesToken, upload.single('file'), supportController.reqSupport);
suportRouter.delete('/:id', verifyAccsesToken, supportController.delete);
suportRouter.patch('/:id/reply', verifyAccsesToken, checkAdmin, supportController.reply);
suportRouter.get('/user/:id/', verifyAccsesToken, supportController.supportByUser);
suportRouter.get('/', verifyAccsesToken, checkAdmin, supportController.index);

export default suportRouter;
