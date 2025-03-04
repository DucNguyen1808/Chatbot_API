import * as jwt from 'jsonwebtoken';
import * as createErrors from 'http-errors';
import { Response, NextFunction } from 'express';
import AuthenticatedRequest from '~/types/AuthenticatedRequest';
import getBearerToken from '~/utils/getBearerToken';
export const createAccsesToken = (payload: object | string): Promise<string> => {
  return new Promise((res, rej) => {
    jwt.sign(
      payload,
      process.env.ACCESS_TOKEN_SECRET as string,
      {
        expiresIn: '15m'
      },
      (error, token) => {
        if (error) rej(error);
        res(token as string);
      }
    );
  });
};
export const createRefreshToken = (payload: object | string): Promise<string> => {
  return new Promise((res, rej) => {
    jwt.sign(
      payload,
      process.env.REFRESH_TOKEN_SECRET as string,
      {
        expiresIn: '3d'
      },
      (error, token) => {
        if (error) rej(error);
        res(token as string);
      }
    );
  });
};

export const verifyAccsesToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const token = getBearerToken(req);
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string, (error, payload) => {
    if (error?.name == 'TokenExpiredError') {
      return next(createErrors.Unauthorized(error.message));
    }
    if (error) {
      return next(createErrors.Unauthorized(error.message));
    }
    req.user = payload;
    next();
  });
};

export const verifyRefreshToken = (refershToken: string) => {
  return new Promise<any>((res, rej) => {
    jwt.verify(refershToken, process.env.REFRESH_TOKEN_SECRET as string, (error, payload) => {
      if (error) rej(error);
      res(payload);
    });
  });
};
