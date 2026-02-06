import React, { useState, useRef } from 'react';
import { Send, Paperclip, Mic, X, Upload, Clock, Square } from 'lucide-react';
import { QueuedMessage } from '../hooks/useChat.js';

interface Props {
    onSend: (content: string, files: File[]) => void;
    disabled: boolean;
    queuedMessages?: QueuedMessage[];
    onRemoveQueuedMessage?: (id: string) => void;
    onStop?: () => void;
    isLoading?: boolean;
}

export const MessageInput: React.FC<Props> = ({ onSend, disabled, queuedMessages = [], onRemoveQueuedMessage, onStop, isLoading }) => {
    const [text, setText] = useState('');
    const [files, setFiles] = useState<File[]>([]);
    const [isListening, setIsListening] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const recognitionRef = useRef<any>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if ((!text.trim() && files.length === 0) || disabled) return;
        onSend(text, files);
        setText('');
        setFiles([]);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
        }
    };

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disabled) setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();

        // Only set dragging to false if we are leaving the main container
        if (e.currentTarget.contains(e.relatedTarget as Node)) {
            return;
        }

        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (disabled) return;

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            setFiles(prev => [...prev, ...Array.from(e.dataTransfer.files)]);
        }
    };

    const toggleSpeech = () => {
        if (isListening) {
            recognitionRef.current?.stop();
            return;
        }

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Speech recognition is not supported in this browser.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => {
            setIsListening(false);
            recognitionRef.current = null;
        };
        recognition.onerror = (event: any) => {
            // Ignore aborted error as it often happens when stopping manually
            if (event.error === 'aborted') return;
            console.error("Speech error", event.error);
            setIsListening(false);
        };
        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setText(prev => prev + (prev ? ' ' : '') + transcript);
        };

        recognitionRef.current = recognition;
        recognition.start();
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="relative group"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition duration-500"></div>

            {queuedMessages.length > 0 && (
                <div className="flex flex-col gap-2 mb-3 relative z-10 px-1">
                    {queuedMessages.map((msg) => (
                        <div key={msg.id} className="flex items-center gap-3 bg-zinc-800/80 text-sm px-4 py-2 rounded-xl text-zinc-300 border border-zinc-700 shadow-sm animate-in fade-in slide-in-from-bottom-2">
                            <Clock className="w-4 h-4 text-blue-400 animate-pulse" />
                            <div className="flex-1 truncate">
                                <span className="font-medium text-zinc-100">Queued:</span> {msg.content}
                                {msg.files.length > 0 && (
                                    <span className="ml-2 text-xs text-zinc-500">
                                        (+{msg.files.length} file{msg.files.length > 1 ? 's' : ''})
                                    </span>
                                )}
                            </div>
                            {onRemoveQueuedMessage && (
                                <button
                                    type="button"
                                    onClick={() => onRemoveQueuedMessage(msg.id)}
                                    className="hover:text-white transition-colors p-1 hover:bg-zinc-700 rounded-lg"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {files.length > 0 && (
                <div className="flex gap-2 mb-3 flex-wrap relative z-10 px-1">
                    {files.map((f, i) => (
                        <div key={i} className="flex items-center gap-2 bg-zinc-800/80 text-xs px-3 py-1.5 rounded-full text-zinc-300 border border-zinc-700 shadow-sm animate-in fade-in slide-in-from-bottom-2">
                            <span className="truncate max-w-[150px] font-medium">{f.name}</span>
                            <button type="button" onClick={() => removeFile(i)} className="hover:text-white transition-colors">
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <div className={`relative flex items-center bg-zinc-900/90 backdrop-blur-xl rounded-2xl border transition-all shadow-xl ${isDragging
                ? 'border-blue-500 ring-2 ring-blue-500/20 bg-zinc-800/90'
                : 'border-zinc-800 focus-within:border-zinc-700'
                }`}>
                {isDragging && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-zinc-900/90 z-20 backdrop-blur-sm border-2 border-dashed border-blue-500 animate-in fade-in duration-200">
                        <div className="flex flex-col items-center text-blue-400">
                            <Upload className="w-8 h-8 mb-2 animate-bounce" />
                            <span className="font-medium">Drop files here</span>
                        </div>
                    </div>
                )}

                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-4 text-zinc-500 hover:text-zinc-300 transition-colors"
                    disabled={disabled}
                    title="Upload file"
                >
                    <Paperclip className="w-5 h-5" />
                </button>
                <input
                    type="file"
                    multiple
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileSelect}
                    accept=".txt,.json,.md"
                />

                <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Message THREAD AI..."
                    className="flex-1 bg-transparent text-zinc-100 py-4 focus:outline-none placeholder-zinc-600 font-medium z-10"
                    disabled={disabled}
                />

                <button
                    type="button"
                    onClick={toggleSpeech}
                    className={`p-4 transition-colors ${isListening ? 'text-red-500 animate-pulse' : 'text-zinc-500 hover:text-zinc-300'}`}
                    disabled={disabled}
                    title="Voice input"
                >
                    <Mic className="w-5 h-5" />
                </button>

                <div className="p-2 pr-2 z-10">
                    <button
                        type={isLoading && (!text.trim() && files.length === 0) ? "button" : "submit"}
                        onClick={(e) => {
                            const hasContent = text.trim() || files.length > 0;
                            if (isLoading && !hasContent && onStop) {
                                e.preventDefault();
                                onStop();
                            }
                        }}
                        className={`p-2.5 rounded-xl transition-all flex items-center justify-center ${isLoading && (!text.trim() && files.length === 0)
                                ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20'
                                : ((!text.trim() && files.length === 0) || disabled)
                                    ? 'text-zinc-600 bg-zinc-800 cursor-not-allowed'
                                    : 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-500/20'
                            }`}
                        disabled={
                            isLoading
                                ? false
                                : (!text.trim() && files.length === 0) || disabled
                        }
                    >
                        {isLoading && (!text.trim() && files.length === 0) ? <Square className="w-4 h-4 fill-current" /> : <Send className="w-4 h-4" />}
                    </button>
                </div>
            </div>
        </form>
    );
};
