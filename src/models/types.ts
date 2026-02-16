export interface ModelConfig {
  id: string;
  name: string;
  provider: 'deepseek' | 'kimi';
  supportsStreaming: boolean;
  supportsReasoning: boolean;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface CompletionRequest {
  model: string;
  messages: ChatMessage[];
  stream?: boolean;
}

export interface StreamChunk {
    type: 'reasoning' | 'content';
    text: string;
}

export interface ModelAdapter {
  chat(request: CompletionRequest): AsyncGenerator<StreamChunk, void, unknown>;
}
