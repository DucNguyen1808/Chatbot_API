import { Application } from 'express';
import authRouter from './authRouter';
import userRouter from './userRouter';

function routes(app: Application) {
  app.get('/api', (req, res) => {
    console.log('123');
    res.send('hello');
  });
  app.use('/api', authRouter);
  app.use('/api/user', userRouter);
}

export default routes;
