import React, { useState } from 'react';
import { MessageSquare, Plus, Trash2, Search, ChevronLeft, ChevronRight, Menu, Settings } from 'lucide-react';
import { ChatSession } from '../hooks/useChat.js';
import { SettingsModal } from './SettingsModal.js';

interface ChatSidebarProps {
    chats: Record<string, ChatSession>;
    currentChatId: string | null;
    onSelectChat: (id: string) => void;
    onDeleteChat: (id: string) => void;
    onNewChat: () => void;
    autoSendEnabled: boolean;
    setAutoSendEnabled: (enabled: boolean) => void;
}

export function ChatSidebar({ chats, currentChatId, onSelectChat, onDeleteChat, onNewChat, autoSendEnabled, setAutoSendEnabled }: ChatSidebarProps) {
    const [isOpen, setIsOpen] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [chatToDelete, setChatToDelete] = useState<string | null>(null);
    const [showSettings, setShowSettings] = useState(false);

    const sortedChats = Object.values(chats)
        .sort((a, b) => b.createdAt - a.createdAt)
        .filter(chat => chat.title.toLowerCase().includes(searchQuery.toLowerCase()));

    const handleDeleteClick = (e: React.MouseEvent, chatId: string) => {
        e.stopPropagation();
        if (e.shiftKey) {
            onDeleteChat(chatId);
        } else {
            setChatToDelete(chatId);
        }
    };

    const confirmDelete = () => {
        if (chatToDelete) {
            onDeleteChat(chatToDelete);
            setChatToDelete(null);
        }
    };

    return (
        <>
            {/* Settings Modal */}
            <SettingsModal 
                isOpen={showSettings} 
                onClose={() => setShowSettings(false)} 
                autoSendEnabled={autoSendEnabled}
                setAutoSendEnabled={setAutoSendEnabled}
            />

            {/* Delete Confirmation Modal */}
            {chatToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-w-sm w-full shadow-xl">
                        <h3 className="text-lg font-semibold text-zinc-100 mb-2">Delete Chat?</h3>
                        <p className="text-zinc-400 text-sm mb-6">
                            Are you sure you want to delete this chat? This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button 
                                onClick={() => setChatToDelete(null)}
                                className="px-4 py-2 rounded-lg text-sm font-medium text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={confirmDelete}
                                className="px-4 py-2 rounded-lg text-sm font-medium bg-red-600 hover:bg-red-500 text-white transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Mobile Toggle Button */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 ${isOpen ? 'hidden' : 'block'}`}
            >
                <Menu className="w-5 h-5" />
            </button>

            {/* Sidebar Container */}
            <div className={`${isOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full hidden'} 
                transition-all duration-300 ease-in-out fixed md:relative h-full z-40
                flex flex-col bg-zinc-950 border-r border-zinc-900/50 flex-shrink-0`}
            >
                {/* Header */}
                <div className="p-4 border-b border-zinc-900/50 flex items-center justify-between">
                     <button 
                        onClick={onNewChat}
                        className="flex-1 flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        New Chat
                    </button>
                    <button 
                        onClick={() => setIsOpen(false)}
                        className="ml-2 p-2 hover:bg-zinc-900 rounded-lg text-zinc-400"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                </div>

                {/* Search */}
                <div className="p-4 pb-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <input 
                            type="text" 
                            placeholder="Search chats..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 bg-zinc-900/50 border border-zinc-800 rounded-lg text-sm text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50"
                        />
                    </div>
                </div>

                {/* Chat List */}
                <div className="flex-1 overflow-y-auto scrollbar-thin p-2 space-y-1">
                    {sortedChats.map(chat => (
                        <div 
                            key={chat.id}
                            className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                                currentChatId === chat.id 
                                    ? 'bg-zinc-900 border border-zinc-800' 
                                    : 'hover:bg-zinc-900/50 border border-transparent'
                            }`}
                            onClick={() => onSelectChat(chat.id)}
                        >
                            <div className="flex items-center gap-3 overflow-hidden flex-1">
                                <MessageSquare className={`w-4 h-4 flex-shrink-0 ${
                                    currentChatId === chat.id ? 'text-blue-400' : 'text-zinc-500'
                                }`} />
                                {chat.isGeneratingTitle ? (
                                    <div className="flex items-center gap-1 h-5">
                                        <span className="w-1 h-1 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                        <span className="w-1 h-1 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                        <span className="w-1 h-1 bg-zinc-500 rounded-full animate-bounce"></span>
                                    </div>
                                ) : (
                                    <span className={`text-sm truncate ${
                                        currentChatId === chat.id ? 'text-zinc-200' : 'text-zinc-400'
                                    }`}>
                                        {chat.title}
                                    </span>
                                )}
                            </div>
                            <button 
                                onClick={(e) => handleDeleteClick(e, chat.id)}
                                className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/10 hover:text-red-400 text-zinc-500 rounded-md transition-all"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    ))}
                    
                    {sortedChats.length === 0 && (
                        <div className="text-center py-8 text-zinc-600 text-xs">
                            No chats found
                        </div>
                    )}
                </div>

                {/* Footer Settings */}
                <div className="p-4 border-t border-zinc-900/50">
                    <button 
                        onClick={() => setShowSettings(true)}
                        className="flex items-center gap-3 w-full p-2 hover:bg-zinc-900 rounded-lg text-zinc-400 hover:text-zinc-200 transition-colors"
                    >
                        <Settings className="w-4 h-4" />
                        <span className="text-sm font-medium">Settings</span>
                    </button>
                </div>
            </div>

            {/* Expand Button (when closed) */}
             <div className={`${!isOpen ? 'w-12 opacity-100' : 'w-0 opacity-0 overflow-hidden'} transition-all duration-300 relative flex-shrink-0 hidden md:flex flex-col border-r border-zinc-900/50 bg-zinc-950`}>
                 <div className="p-4 flex flex-col items-center gap-4">
                    <button 
                        onClick={() => setIsOpen(true)}
                        className="p-2 hover:bg-zinc-900 rounded-lg text-zinc-400"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={onNewChat}
                        className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => setShowSettings(true)}
                        className="p-2 hover:bg-zinc-900 rounded-lg text-zinc-400"
                    >
                        <Settings className="w-4 h-4" />
                    </button>
                 </div>
            </div>
        </>
    );
}
