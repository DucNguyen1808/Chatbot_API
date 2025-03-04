import { z } from 'zod';

export const LoginsChema = z
  .object({
    email: z.string().email('Email không đúng định dạng'),
    password: z.string().min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
  })
  .strict();

export const RegisterChema = LoginsChema.extend({
  name: z.string().refine((value) => value.trim().split(/\s+/).length >= 2, {
    message: 'Họ và tên phải có ít nhất 2 từ'
  })
}).strict();
