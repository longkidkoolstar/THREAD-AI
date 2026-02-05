import { Request, Response } from 'express';
import { getModelAdapter } from '../models/index';
import { ChatMessage } from '../models/types';

export const handleTitle = async (req: Request, res: Response) => {
    const { model, messages } = req.body;
    
    try {
        const adapter = getModelAdapter(model);
        if (!adapter) {
            return res.status(400).json({ error: 'Model not supported' });
        }

        // Create a summarization prompt
        // We only take the first few messages to avoid context overflow and save tokens, 
        // as we only need the initial topic.
        const contextMessages = messages.slice(0, 4);
        
        const titlePrompt: ChatMessage[] = [
            ...contextMessages,
            { 
                role: 'user', 
                content: 'Generate a short, concise title (max 5 words) for this conversation based on the initial messages. Do not use quotes, prefixes, or "Title:". Just the title text itself.' 
            }
        ];

        const stream = adapter.chat({ model, messages: titlePrompt, stream: false });
        
        let title = '';
        for await (const chunk of stream) {
            if (chunk.type === 'content') {
                title += chunk.text;
            }
        }

        // Cleanup title
        title = title.replace(/^["']|["']$/g, '').replace(/^Title:\s*/i, '').trim();

        res.json({ title });

    } catch (error) {
        console.error('Title generation error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
