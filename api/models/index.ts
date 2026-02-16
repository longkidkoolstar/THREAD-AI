import { ModelAdapter, ModelConfig } from './types.js';
import { DeepSeekAdapter } from './deepseek.js';
import { KimiAdapter } from './kimi.js';

export const models: ModelConfig[] = [
    {
        id: 'deepseek-chat',
        name: 'DeepSeek V3',
        provider: 'deepseek',
        supportsStreaming: true,
        supportsReasoning: false
    },
    {
        id: 'deepseek-reasoner',
        name: 'DeepSeek R1',
        provider: 'deepseek',
        supportsStreaming: true,
        supportsReasoning: true
    },
    {
        id: 'kimi-k2.5',
        name: 'Kimi K2.5 Thinking',
        provider: 'kimi',
        supportsStreaming: true,
        supportsReasoning: true
    },
    {
        id: 'kimi-k2-turbo-preview',
        name: 'Kimi K2',
        provider: 'kimi',
        supportsStreaming: true,
        supportsReasoning: false
    }
];

let deepseekAdapter: DeepSeekAdapter | null = null;
let kimiAdapter: KimiAdapter | null = null;

export function getModelAdapter(modelId: string): ModelAdapter | null {
    const model = models.find(m => m.id === modelId);
    if (!model) return null;

    if (model.provider === 'deepseek') {
        if (!deepseekAdapter) {
            deepseekAdapter = new DeepSeekAdapter();
        }
        return deepseekAdapter;
    }
    
    if (model.provider === 'kimi') {
        if (!kimiAdapter) {
            kimiAdapter = new KimiAdapter();
        }
        return kimiAdapter;
    }
    
    return null;
}
