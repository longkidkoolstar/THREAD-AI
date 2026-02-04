import OpenAI from 'openai';
import { ModelAdapter, CompletionRequest, StreamChunk } from './types';

export class DeepSeekAdapter implements ModelAdapter {
    private client: OpenAI;

    constructor(apiKey?: string) {
        const key = apiKey || process.env.DEEPSEEK_API_KEY;
        if (!key) {
            throw new Error("Missing DeepSeek API Key. Please set DEEPSEEK_API_KEY in .env");
        }
        this.client = new OpenAI({
            baseURL: 'https://api.deepseek.com',
            apiKey: key
        });
    }

    async *chat(request: CompletionRequest): AsyncGenerator<StreamChunk, void, unknown> {
        try {
            const stream = await this.client.chat.completions.create({
                model: request.model,
                messages: request.messages,
                stream: true,
            });

            for await (const chunk of stream) {
                // Check for reasoning content (DeepSeek R1 specific)
                // Note: The OpenAI SDK might put this in a different field depending on compatibility,
                // but usually it's in delta.content or a specific reasoning_content field if using raw API.
                // Since we are using OpenAI SDK compatibility layer, DeepSeek maps reasoning_content to 'reasoning_content'
                // We need to cast chunk to any to access potentially non-standard fields or just check choices.
                
                const delta = chunk.choices[0]?.delta as any;
                
                if (delta?.reasoning_content) {
                    yield { type: 'reasoning', text: delta.reasoning_content };
                }

                if (delta?.content) {
                    yield { type: 'content', text: delta.content };
                }
            }
        } catch (error) {
            console.error('DeepSeek API Error:', error);
            throw error;
        }
    }
}
