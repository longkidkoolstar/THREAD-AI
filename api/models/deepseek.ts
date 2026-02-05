import OpenAI from 'openai';
import { ModelAdapter, CompletionRequest, StreamChunk } from './types.js';

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
        console.log(`[DeepSeek] Starting chat request for model: ${request.model}`);
        try {
            const stream = await this.client.chat.completions.create({
                model: request.model,
                messages: request.messages,
                stream: true,
            });

            for await (const chunk of stream) {
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
            if (error instanceof OpenAI.APIError) {
                console.error('DeepSeek API Error Details:', {
                    status: error.status,
                    message: error.message,
                    code: error.code,
                    type: error.type
                });
            }
            throw error;
        }
    }
}
