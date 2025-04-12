import express from 'express';
import authController from '~/controllers/AuthController';

const authRouter = express.Router();

authRouter.post('/login', authController.login);
authRouter.post('/register', authController.register);
authRouter.post('/refresh-token', authController.refreshToken);
authRouter.post('/auth/google', authController.loginWithGoogle);
export default authRouter;
