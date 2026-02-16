import OpenAI from 'openai';
import { ModelAdapter, CompletionRequest, StreamChunk } from './types.js';

export class KimiAdapter implements ModelAdapter {
    private client: OpenAI;

    constructor(apiKey?: string) {
        const key = apiKey || process.env.KIMI_API_KEY;
        if (!key) {
            throw new Error("Missing Kimi API Key. Please set KIMI_API_KEY in .env");
        }
        this.client = new OpenAI({
            baseURL: 'https://api.moonshot.ai/v1',
            apiKey: key
        });
    }

    async *chat(request: CompletionRequest): AsyncGenerator<StreamChunk, void, unknown> {
        console.log(`[Kimi] Starting chat request for model: ${request.model}`);
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
            console.error('Kimi API Error:', error);
            if (error instanceof OpenAI.APIError) {
                console.error('Kimi API Error Details:', {
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
