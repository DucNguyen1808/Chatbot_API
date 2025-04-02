import express from 'express';
import promptController from '~/controllers/PromptController';
const promptRouter = express.Router();

promptRouter.get('/', promptController.index);
promptRouter.post('/', promptController.store);
promptRouter.get('/:id', promptController.show);
promptRouter.delete('/', promptController.delete);
promptRouter.put('/', promptController.update);

export default promptRouter;
