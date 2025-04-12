import express from 'express';
import userController from '~/controllers/UserController';
import checkAdmin from '~/middlewares/checkAdmin';
import { upload } from '~/middlewares/uploadImages';
import { verifyAccsesToken } from '~/utils/jwt';

const userRouter = express.Router();

userRouter.get('/get-profile', verifyAccsesToken, userController.getProfile);
userRouter.get('/statistical', userController.statistical);
userRouter.get('/get-all-user', userController.getAllProfile);
userRouter.delete('/', userController.delete);
userRouter.patch('/update-role', userController.updateRole);
userRouter.patch('/block', userController.blockAccount);
userRouter.patch('/change-password', userController.changePassword);
userRouter.patch('/update-profile', verifyAccsesToken, upload.single('avatar'), userController.updateProfile);
userRouter.post('/forgot-password', userController.forgotPassword);
userRouter.patch('/reset-password', userController.resetPassword);
userRouter.get('/export-excel', verifyAccsesToken, checkAdmin, userController.exportUsersToExcel);

export default userRouter;
