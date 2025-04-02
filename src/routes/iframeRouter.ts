import express from 'express';
import iframeController from '~/controllers/IfameController';
import { upload } from '~/middlewares/uploadImages';
const iframeRouter = express.Router();

iframeRouter.get('/', iframeController.index);
iframeRouter.post('/', upload.single('icon'), iframeController.store);
iframeRouter.get('/:id', iframeController.show);
iframeRouter.delete('/', iframeController.delete);
iframeRouter.put('/', upload.single('icon'), iframeController.update);

export default iframeRouter;
