import { Request, Response } from 'express';
import { getModelAdapter } from './models/index.js';

export const handleChat = async (req: Request, res: Response) => {
    const { model, messages } = req.body;

    try {
        const adapter = getModelAdapter(model);
        if (!adapter) {
            return res.status(400).json({ error: 'Model not supported' });
        }

        // Set headers for SSE
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        const stream = adapter.chat({ model, messages, stream: true });

        for await (const chunk of stream) {
            res.write(`data: ${JSON.stringify(chunk)}\n\n`);
        }

        res.write('data: [DONE]\n\n');
        res.end();

    } catch (error) {
        console.error('Chat error:', error);
        // If headers are already sent, we can't send a JSON error
        if (!res.headersSent) {
            res.status(500).json({
                error: 'Internal server error',
                details: error instanceof Error ? error.message : String(error)
            });
        } else {
            res.write(`data: ${JSON.stringify({
                type: 'error',
                text: 'Internal server error',
                details: error instanceof Error ? error.message : String(error)
            })}\n\n`);
            res.end();
        }
    }
};

export default handleChat;
