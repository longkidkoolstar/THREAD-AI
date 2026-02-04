import { useState } from 'react';

export interface MessageFile {
    name: string;
    content: string;
    type: string;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  reasoning?: string;
  files?: MessageFile[];
}

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentModel, setCurrentModel] = useState('deepseek-chat');

  const sendMessage = async (content: string, files: File[]) => {
    // 1. Handle file uploads if any
    let fileContext = '';
    const attachedFiles: MessageFile[] = [];

    if (files.length > 0) {
        for (const file of files) {
            const formData = new FormData();
            formData.append('file', file);
            try {
                const res = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData
                });
                const data = await res.json();
                if (data.file && data.file.content) {
                    fileContext += `\n\n[File: ${data.file.originalname}]\n${data.file.content}\n`;
                    attachedFiles.push({
                        name: data.file.originalname,
                        content: data.file.content,
                        type: data.file.mimetype
                    });
                }
            } catch (e) {
                console.error("Upload failed", e);
            }
        }
    }

    // We keep the file content invisible in the UI message content but send it to the LLM
    const displayContent = content; 
    const fullContent = content + fileContext;

    const userMsg: Message = { 
        role: 'user', 
        content: displayContent,
        files: attachedFiles
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    // Placeholder for assistant
    setMessages(prev => [...prev, { role: 'assistant', content: '', reasoning: '' }]);
    
    try {
        // Construct messages for API: use fullContent (with file context) for the last user message
        const apiMessages = [...messages, { ...userMsg, content: fullContent }].map(m => ({ 
            role: m.role, 
            content: m.content 
        }));

        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: currentModel,
                messages: apiMessages
            })
        });

        if (!response.body) throw new Error("No response body");

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        let assistantContent = '';
        let assistantReasoning = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            // Keep the last line in buffer if it's incomplete
            buffer = lines.pop() || '';

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const dataStr = line.slice(6).trim();
                    if (dataStr === '[DONE]') continue;
                    if (!dataStr) continue;
                    
                    try {
                        const data = JSON.parse(dataStr);
                        if (data.type === 'reasoning') {
                            assistantReasoning += data.text;
                        } else if (data.type === 'content') {
                            assistantContent += data.text;
                        }
                        
                        setMessages(prev => {
                            const newMsgs = [...prev];
                            newMsgs[newMsgs.length - 1] = {
                                role: 'assistant',
                                content: assistantContent,
                                reasoning: assistantReasoning
                            };
                            return newMsgs;
                        });

                    } catch (e) {
                        console.error("Error parsing SSE:", e);
                    }
                }
            }
        }

    } catch (error) {
        console.error("Chat error:", error);
        setMessages(prev => {
            const newMsgs = [...prev];
            newMsgs[newMsgs.length - 1] = {
                role: 'assistant',
                content: 'Error: Failed to generate response.',
                reasoning: ''
            };
            return newMsgs;
        });
    } finally {
        setIsLoading(false);
    }
  };

  return { messages, isLoading, sendMessage, currentModel, setCurrentModel };
}
