import { ModelAdapter, ModelConfig } from './types.js';
import { DeepSeekAdapter } from './deepseek.js';

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
