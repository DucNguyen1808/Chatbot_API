import express from 'express';
import iframeController from '~/controllers/IfameController';
import checkAdmin from '~/middlewares/checkAdmin';
import { upload } from '~/middlewares/uploadImages';
import { verifyAccsesToken } from '~/utils/jwt';

const iframeRouter = express.Router();

iframeRouter.post('/', verifyAccsesToken, checkAdmin, upload.single('icon'), iframeController.store);
iframeRouter.get('/', iframeController.show);
iframeRouter.delete('/', verifyAccsesToken, checkAdmin, iframeController.delete);
iframeRouter.put('/', verifyAccsesToken, checkAdmin, upload.single('icon'), iframeController.update);

export default iframeRouter;
