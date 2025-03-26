import { Application } from 'express';
import authRouter from './authRouter';
import userRouter from './userRouter';
import messagesRouter from './messagesRouter';
import promptRouter from './promptRouter';

function routes(app: Application) {
  app.get('/api', (req, res) => {
    console.log('123');
    res.send('hello');
  });
  app.use('/api', authRouter);
  app.use('/api/user', userRouter);
  app.use('/api/', userRouter);
  app.use('/api/chat/', messagesRouter);
  app.use('/api/prompt', promptRouter);
}

export default routes;
