import { Router } from 'express';
import { handleChat } from './chat.js';
import { handleTitle } from './title.js';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });
export const apiRouter = Router();

apiRouter.post('/chat', handleChat);
apiRouter.post('/title', handleTitle);
apiRouter.post('/upload', upload.single('file'), (req, res) => {
    // In a real app, we would process/store the file here
    // For now, we just return the metadata so the UI can "see" it
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    
    // We can extract text content here if it's a text file
    let content = '';
    if (req.file.mimetype.startsWith('text/') || req.file.originalname.endsWith('.json') || req.file.originalname.endsWith('.md')) {
        content = req.file.buffer.toString('utf-8');
    }

    res.json({ 
        message: 'File uploaded', 
        file: {
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size,
            content: content // Send back content for context injection
        }
    });
});
