import express from 'express';
import userController from '~/controllers/UserController';
import { verifyAccsesToken } from '~/utils/jwt';

const userRouter = express.Router();

userRouter.get('/get-profile', verifyAccsesToken, userController.getProfile);
userRouter.get('/get-all-user', userController.getAllProfile);
export default userRouter;
