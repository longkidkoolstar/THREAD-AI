import { ModelAdapter, ModelConfig } from './types';
import { DeepSeekAdapter } from './deepseek';

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
    }
];

// Singleton instances to reuse connections if needed
let deepseekAdapter: DeepSeekAdapter | null = null;

export function getModelAdapter(modelId: string): ModelAdapter | null {
    const model = models.find(m => m.id === modelId);
    if (!model) return null;

    if (model.provider === 'deepseek') {
        if (!deepseekAdapter) {
            deepseekAdapter = new DeepSeekAdapter();
        }
        return deepseekAdapter;
    }
    
    return null;
}
