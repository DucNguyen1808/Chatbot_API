import express from 'express';
import userController from '~/controllers/UserController';
import { upload } from '~/middlewares/uploadImages';
import { verifyAccsesToken } from '~/utils/jwt';

const userRouter = express.Router();

userRouter.get('/get-profile', verifyAccsesToken, userController.getProfile);
userRouter.get('/get-all-user', userController.getAllProfile);
userRouter.delete('/', userController.delete);
userRouter.patch('/update-role', userController.updateRole);
userRouter.patch('/block', userController.blockAccount);
userRouter.patch('/change-password', userController.changePassword);
userRouter.patch('/update-profile', verifyAccsesToken, upload.single('avatar'), userController.updateProfile);
export default userRouter;
