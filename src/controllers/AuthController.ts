import { NextFunction, Request, Response } from 'express';
import User from '~/models/User';
import { createAccsesToken, createRefreshToken, verifyRefreshToken } from '~/utils/jwt';
import getBearerToken from '~/utils/getBearerToken';
import { LoginsChema, RegisterChema } from '~/validations/AuthValidate';
const EXPIRES_IN = 24 * 60 * 60 * 1000;
class AuthController {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body;
      const validateLogin = LoginsChema.safeParse(data);
      if (!validateLogin.success) {
        next(validateLogin.error);
        return;
      }
      const { password, email } = data;

      const user = await User.findOne({ email });
      if (!user) {
        res.status(404).json({ status_code: 404, message: 'Email này chưa được đăng ký' });
        return;
      }
      const ispassword = await user.checkPassword(password);
      if (ispassword) {
        res.status(401).json({ status_code: 404, message: 'Sai mật khẩu' });
        return;
      }
      const payload = {
        id: user._id
      };
      const accsessToken = await createAccsesToken(payload);
      const refreshToken = await createRefreshToken(payload);
      const now = new Date();
      const tenMinutesLater = new Date(now.getTime() + EXPIRES_IN);
      res.status(200).json({
        status_code: 200,
        message: 'Login successfully',
        accsessToken,
        refreshToken,
        expiredAt: tenMinutesLater
      });
    } catch (error) {
      next(error);
    }
  }
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body;
      const validateRegister = RegisterChema.safeParse(data);
      if (!validateRegister.success) {
        next(validateRegister.error);
        return;
      }
      const { email, password, name } = data;
      const user = await User.findOne({ email });
      if (user) {
        res
          .status(422)
          .json({ message: 'Email đã tồn tại', errors: [{ message: 'Email đã tồn tại', path: ['email'] }] });
      }

      const newUser = await User.create({ name, email, password });
      res.status(201).json(newUser);
    } catch (err) {
      next(err);
    }
  }
  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const Token = getBearerToken(req);
      const payload = await verifyRefreshToken(Token);
      const accsesToken = await createAccsesToken({ id: payload.id });
      const refreshToken = await createRefreshToken({ id: payload.id });
      res.json({ accsesToken, refreshToken });
    } catch (error) {
      next(error);
    }
  }
}

const authController = new AuthController();
export default authController;
