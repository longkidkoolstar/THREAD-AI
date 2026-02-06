import { Request, Response } from 'express';
import multer from 'multer';

// Configure multer
const upload = multer({ storage: multer.memoryStorage() });

// Disable body parser for Vercel so multer can handle it
export const config = {
    api: {
        bodyParser: false,
    },
};

// Helper method to wait for a middleware to execute before continuing
function runMiddleware(req: any, res: any, fn: any) {
    return new Promise((resolve, reject) => {
        fn(req, res, (result: any) => {
            if (result instanceof Error) {
                return reject(result);
            }
            return resolve(result);
        });
    });
}

// The core logic for handling the upload
export const handleUpload = (req: Request, res: Response) => {
    // @ts-ignore - req.file is added by multer
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    // @ts-ignore - req.file is added by multer
    const file = req.file;

    // We can extract text content here if it's a text file
    let content = '';
    if (file.mimetype.startsWith('text/') || file.originalname.endsWith('.json') || file.originalname.endsWith('.md')) {
        content = file.buffer.toString('utf-8');
    }

    res.json({
        message: 'File uploaded',
        file: {
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            content: content // Send back content for context injection
        }
    });
};

// Default export for Vercel serverless function
// Wraps the middleware and the handler
export default async function handler(req: Request, res: Response) {
    try {
        await runMiddleware(req, res, upload.single('file'));
        handleUpload(req, res);
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
            error: 'Internal server error processing upload',
            details: error instanceof Error ? error.message : String(error)
        });
    }
}
