import express from 'express';
import SettingController from '~/controllers/SettingController';
import checkAdmin from '~/middlewares/checkAdmin';
import { upload } from '~/middlewares/uploadImages';
import { verifyAccsesToken } from '~/utils/jwt';

const settingRouter = express.Router();

settingRouter.post('/', SettingController.store);
settingRouter.get('/', SettingController.index);

export default settingRouter;
