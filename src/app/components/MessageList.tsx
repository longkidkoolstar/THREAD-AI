import React, { useEffect, useRef, useState, useLayoutEffect } from 'react';
import { Message } from '../hooks/useChat.js';
import ReactMarkdown from 'react-markdown';
import { ReasoningPanel } from './ReasoningPanel.js';
import { CodeBlock } from './CodeBlock.js';
import { User, Bot, FileText, ArrowDown, RotateCcw } from 'lucide-react';

interface Props {
    messages: Message[];
    isLoading: boolean;
    onUndo?: (messageIndex: number) => void;
}

export const MessageList: React.FC<Props> = ({ messages, isLoading, onUndo }) => {
    const bottomRef = useRef<HTMLDivElement>(null);
    const [showScrollButton, setShowScrollButton] = useState(false);
    const [autoScroll, setAutoScroll] = useState(true);
    const [fadingIndices, setFadingIndices] = useState<Set<number>>(new Set());

    // Detect user scroll to disable auto-scroll
    useEffect(() => {
        // Finding the scrollable parent (closest .overflow-y-auto)
        const scrollParent = bottomRef.current?.closest('.overflow-y-auto');
        if (scrollParent) {
            const onScroll = () => {
                const { scrollTop, scrollHeight, clientHeight } = scrollParent;
                const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
                
                setAutoScroll(isNearBottom);
                setShowScrollButton(!isNearBottom);
            };
            
            scrollParent.addEventListener('scroll', onScroll);
            return () => scrollParent.removeEventListener('scroll', onScroll);
        }
    }, []);

    // Auto-scroll effect
    useLayoutEffect(() => {
        if (autoScroll) {
            bottomRef.current?.scrollIntoView({ behavior: 'auto' });
        }
    }, [messages, autoScroll, messages[messages.length-1]?.content]); // Trigger on content updates

    const scrollToBottom = () => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        setAutoScroll(true);
    };

    const handleUndoClick = (idx: number) => {
        // Fade out the clicked message and all messages after it
        const indicesToFade = new Set<number>();
        for (let i = idx; i < messages.length; i++) {
            indicesToFade.add(i);
        }
        setFadingIndices(indicesToFade);
        
        setTimeout(() => {
            onUndo?.(idx);
            setFadingIndices(new Set());
        }, 300);
    };

    return (
        <div className="space-y-6 pb-4 relative">
            {messages.map((msg, idx) => (
                <div 
                    key={idx} 
                    className={`flex gap-4 group ${msg.role === 'user' ? 'justify-end' : 'justify-start'} transition-all duration-300 ${
                        fadingIndices.has(idx) ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
                    }`}
                >
                    {msg.role === 'assistant' && (
                        <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                            <Bot className="w-5 h-5 text-blue-400" />
                        </div>
                    )}
                    
                    <div className={`flex flex-col max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                        {msg.role === 'assistant' && msg.reasoning && (
                            <div className="w-full">
                                <ReasoningPanel content={msg.reasoning} />
                            </div>
                        )}
                        
                        <div className="flex items-end gap-2">
                            {/* Undo Button - Only for user messages, positioned on left */}
                            {msg.role === 'user' && onUndo && (
                                <button
                                    onClick={() => handleUndoClick(idx)}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg hover:bg-zinc-700/50 text-zinc-400 hover:text-zinc-200 flex-shrink-0"
                                    title="Undo this message"
                                    aria-label="Undo this message"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                </button>
                            )}

                            <div className={`rounded-xl px-5 py-3.5 shadow-sm leading-relaxed ${
                                msg.role === 'user' 
                                    ? 'bg-blue-600 text-white rounded-br-none shadow-blue-900/20' 
                                    : 'bg-zinc-800/80 backdrop-blur-sm text-zinc-100 rounded-bl-none border border-zinc-700/50'
                            }`}>
                                {msg.role === 'user' ? (
                                    <div className="space-y-2">
                                        {msg.files && msg.files.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mb-2">
                                                {msg.files.map((file, i) => (
                                                    <div key={i} className="flex items-center gap-2 bg-blue-500/50 rounded-lg px-3 py-2 text-sm border border-blue-400/30">
                                                        <FileText className="w-4 h-4" />
                                                        <span className="truncate max-w-[200px]">{file.name}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        <div className="whitespace-pre-wrap">{msg.content}</div>
                                    </div>
                                ) : (
                                    <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-transparent prose-pre:p-0 prose-pre:border-none">
                                        <ReactMarkdown
                                            components={{
                                                code({ node, className, children, ...props }) {
                                                    const match = /language-(\w+)/.exec(className || '');
                                                    return match ? (
                                                        <CodeBlock
                                                            language={match[1]}
                                                            value={String(children).replace(/\n$/, '')}
                                                        />
                                                    ) : (
                                                        <code className={`${className} bg-zinc-700/50 rounded px-1.5 py-0.5 text-zinc-200`} {...props}>
                                                            {children}
                                                        </code>
                                                    )
                                                }
                                            }}
                                        >
                                            {msg.content}
                                        </ReactMarkdown>
                                        {/* Cursor for streaming assistant message if it's the last one and loading */}
                                        {idx === messages.length - 1 && isLoading && msg.role === 'assistant' && (
                                            <span className="inline-block w-1.5 h-4 ml-1 bg-blue-400 animate-blink align-middle rounded-full"></span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {msg.role === 'user' && (
                        <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                            <User className="w-5 h-5 text-zinc-400" />
                        </div>
                    )}
                </div>
            ))}
            
            <div ref={bottomRef} />

            {/* Floating Scroll Button */}
            {showScrollButton && (
                <button
                    onClick={scrollToBottom}
                    className="fixed bottom-24 right-8 p-3 bg-blue-600 text-white rounded-full shadow-lg shadow-blue-900/40 hover:bg-blue-500 transition-all animate-in fade-in slide-in-from-bottom-4 z-50 border border-blue-400/20"
                    aria-label="Scroll to bottom"
                >
                    <ArrowDown className="w-5 h-5" />
                </button>
            )}
        </div>
    );
};
