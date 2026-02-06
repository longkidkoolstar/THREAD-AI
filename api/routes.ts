import { Router } from 'express';
import { handleChat } from './chat.js';
import { handleTitle } from './title.js';
import { handleUpload } from './upload.js';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });
export const apiRouter = Router();

apiRouter.post('/chat', handleChat);
apiRouter.post('/title', handleTitle);
apiRouter.post('/upload', upload.single('file'), handleUpload);
