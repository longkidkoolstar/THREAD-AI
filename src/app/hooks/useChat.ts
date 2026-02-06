import { useState, useEffect, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import LZString from 'lz-string';

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

export interface QueuedMessage {
    id: string;
    content: string;
    files: File[];
}

export interface ChatSession {
    id: string;
    title: string;
    messages: Message[];
    createdAt: number;
    model: string;
    autoRenamed?: boolean;
    isGeneratingTitle?: boolean;
}

export function useChat() {
    const [chats, setChats] = useState<Record<string, ChatSession>>({});
    const [currentChatId, setCurrentChatId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [currentModel, setCurrentModel] = useState('deepseek-chat');
    const [autoSendEnabled, setAutoSendEnabled] = useState(false);
    const [queuedMessages, setQueuedMessages] = useState<QueuedMessage[]>([]);
    const abortControllerRef = useRef<AbortController | null>(null);

    const stopGeneration = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }
    }, []);

    // Load autoSendEnabled from local storage
    useEffect(() => {
        const savedAutoSend = localStorage.getItem('thread-ai-auto-send');
        if (savedAutoSend) {
            setAutoSendEnabled(JSON.parse(savedAutoSend));
        }
    }, []);

    // Save autoSendEnabled to local storage
    useEffect(() => {
        localStorage.setItem('thread-ai-auto-send', JSON.stringify(autoSendEnabled));
    }, [autoSendEnabled]);

    // Load chats from local storage
    useEffect(() => {
        const savedChats = localStorage.getItem('thread-ai-chats');
        if (savedChats) {
            try {
                const decompressed = LZString.decompressFromUTF16(savedChats);
                const parsed = JSON.parse(decompressed || '{}');
                setChats(parsed);

                // Select the most recent chat or create new
                const chatIds = Object.keys(parsed);
                if (chatIds.length > 0) {
                    const sorted = chatIds.sort((a, b) => parsed[b].createdAt - parsed[a].createdAt);
                    setCurrentChatId(sorted[0]);
                    setCurrentModel(parsed[sorted[0]].model);
                } else {
                    createNewChat();
                }
            } catch (e) {
                console.error("Failed to load chats", e);
                createNewChat();
            }
        } else {
            createNewChat();
        }
    }, []);

    // Save chats to local storage
    useEffect(() => {
        if (Object.keys(chats).length > 0) {
            const stringified = JSON.stringify(chats);
            const compressed = LZString.compressToUTF16(stringified);
            localStorage.setItem('thread-ai-chats', compressed);
        }
    }, [chats]);

    // Auto-generate title
    useEffect(() => {
        if (!currentChatId || !chats[currentChatId] || isLoading) return;

        const chat = chats[currentChatId];
        const userMessages = chat.messages.filter(m => m.role === 'user');

        if (userMessages.length >= 2 && !chat.autoRenamed && chat.messages.length >= 4) {
            // Prevent multiple triggers by marking as renamed immediately
            setChats(prev => ({
                ...prev,
                [currentChatId]: { ...prev[currentChatId], autoRenamed: true }
            }));

            // Prepare messages for title generation (only first few to capture context)
            const contextMessages = chat.messages.slice(0, 4).map(m => ({ role: m.role, content: m.content }));

            fetch('/api/title', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: chat.model,
                    messages: contextMessages
                })
            })
                .then(res => res.json())
                .then(data => {
                    if (data.title) {
                        setChats(prev => ({
                            ...prev,
                            [currentChatId]: {
                                ...prev[currentChatId],
                                title: data.title,
                                autoRenamed: true
                            }
                        }));
                    }
                })
                .catch(e => console.error("Title generation failed", e));
        }
    }, [currentChatId, chats, isLoading]);

    const createNewChat = useCallback(() => {
        const newId = uuidv4();
        const newChat: ChatSession = {
            id: newId,
            title: 'New Chat',
            messages: [],
            createdAt: Date.now(),
            model: 'deepseek-chat'
        };
        setChats(prev => ({ ...prev, [newId]: newChat }));
        setCurrentChatId(newId);
        setCurrentModel('deepseek-chat');
        return newId;
    }, []);

    const deleteChat = useCallback((id: string) => {
        setChats(prev => {
            const newChats = { ...prev };
            delete newChats[id];
            return newChats;
        });
        if (currentChatId === id) {
            setCurrentChatId(null);
        }
    }, [currentChatId]);

    const selectChat = useCallback((id: string) => {
        setCurrentChatId(id);
        if (chats[id]) {
            setCurrentModel(chats[id].model);
        }
    }, [chats]);

    const updateModel = useCallback((model: string) => {
        setCurrentModel(model);
        if (currentChatId) {
            setChats(prev => {
                const chat = prev[currentChatId];
                if (!chat) return prev;
                return {
                    ...prev,
                    [currentChatId]: {
                        ...chat,
                        model: model
                    }
                };
            });
        }
    }, [currentChatId]);

    // Helper to update messages for current chat
    const updateMessages = (updateFn: (prev: Message[]) => Message[]) => {
        if (!currentChatId) return;

        setChats(prev => {
            const chat = prev[currentChatId];
            if (!chat) return prev;

            const newMessages = updateFn(chat.messages);

            // Auto-update title if it's the first user message
            let newTitle = chat.title;
            if (chat.messages.length === 0 && newMessages.length > 0) {
                const firstUserMsg = newMessages.find(m => m.role === 'user');
                if (firstUserMsg) {
                    newTitle = firstUserMsg.content.slice(0, 30) + (firstUserMsg.content.length > 30 ? '...' : '');
                }
            }

            return {
                ...prev,
                [currentChatId]: {
                    ...chat,
                    messages: newMessages,
                    title: newTitle,
                    createdAt: Date.now() // Update timestamp to move to top
                }
            };
        });
    };

    const messages = currentChatId && chats[currentChatId] ? chats[currentChatId].messages : [];

    const sendMessage = async (content: string, files: File[], isFromQueue = false) => {
        if (isLoading && !isFromQueue) {
            if (autoSendEnabled) {
                setQueuedMessages(prev => [...prev, {
                    id: uuidv4(),
                    content,
                    files
                }]);
                return;
            }
            return;
        }

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

        // Use updateMessages instead of setMessages
        updateMessages(prev => [...prev, userMsg]);
        setIsLoading(true);

        // Create a new AbortController for this request
        const abortController = new AbortController();
        abortControllerRef.current = abortController;

        // Placeholder for assistant
        updateMessages(prev => [...prev, { role: 'assistant', content: '', reasoning: '' }]);

        try {
            // Construct messages for API: use fullContent (with file context) for the last user message
            const currentMsgs = chats[currentChatId!]?.messages || [];
            // We need to append the userMsg we just created because updateMessages is async/batched 
            // and might not be reflected in 'messages' or 'chats' immediately if we read it back synchronously.
            // However, 'sendMessage' is async, but we can't await 'setChats'.
            // Safe bet: Construct apiMessages from 'currentMsgs' + 'userMsg'.

            const apiMessages = [...currentMsgs, { ...userMsg, content: fullContent }].map(m => ({
                role: m.role,
                content: m.content
            }));

            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: currentModel,
                    messages: apiMessages
                }),
                signal: abortController.signal
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

                            updateMessages(prev => {
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

        } catch (error: any) {
            if (error.name === 'AbortError') {
                console.log('Generation stopped by user');
                // Keep the partial response
            } else {
                console.error("Chat error:", error);
                updateMessages(prev => {
                    const newMsgs = [...prev];
                    newMsgs[newMsgs.length - 1] = {
                        role: 'assistant',
                        content: 'Error: Failed to generate response.',
                        reasoning: ''
                    };
                    return newMsgs;
                });
            }
        } finally {
            setIsLoading(false);
            abortControllerRef.current = null;
        }
    };

    const processQueue = useCallback(async () => {
        if (queuedMessages.length === 0) return;

        const nextMessage = queuedMessages[0];
        setQueuedMessages(prev => prev.slice(1));
        await sendMessage(nextMessage.content, nextMessage.files, true);
    }, [queuedMessages]);

    useEffect(() => {
        if (!isLoading && queuedMessages.length > 0) {
            processQueue();
        }
    }, [isLoading, queuedMessages, processQueue]);

    return {
        messages,
        isLoading,
        sendMessage,
        currentModel,
        setCurrentModel: updateModel,
        chats,
        currentChatId,
        createNewChat,
        deleteChat,
        selectChat,
        autoSendEnabled,
        setAutoSendEnabled,
        queuedMessages,
        removeQueuedMessage: (id: string) => setQueuedMessages(prev => prev.filter(m => m.id !== id)),
        stopGeneration
    };
}
