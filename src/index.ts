import express, { Application } from 'express';
import errorHandler from './middlewares/errorHandler';
import routes from '../src/routes';
import { connectMongoDB } from './config/db';
import * as createError from 'http-errors';
import ExcelJS from 'exceljs';

import cors from 'cors';
import dotenv from 'dotenv';
import Conversation from './models/Conversation';
dotenv.config();
const app: Application = express();
app.use(cors());
app.use(express.urlencoded({ extended: true }));

app.use(express.json());

const port = 8888;

routes(app);

app.use((req, res, next) => {
  next(createError.NotFound());
});
console.log(process.env.API_KEY);
console.log(process.env.BASE_URL_CHAT_BOT);
app.use(errorHandler);
connectMongoDB();
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
