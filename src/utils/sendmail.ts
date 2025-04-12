import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();
interface SendEmailOptions {
  to: string;
  subject: string;
  text: string;
}

const sendEmail = async ({ to, subject, text }: SendEmailOptions): Promise<void> => {
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  await transporter.sendMail({
    from: 'Hỗ trợ <your.email@gmail.com>',
    to,
    subject,
    text
  });
};

export default sendEmail;
