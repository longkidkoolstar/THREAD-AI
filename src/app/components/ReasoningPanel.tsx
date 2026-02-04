import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Brain } from 'lucide-react';

interface Props {
    content: string;
}

export const ReasoningPanel: React.FC<Props> = ({ content }) => {
    const [isOpen, setIsOpen] = useState(false);

    if (!content) return null;

    return (
        <div className="mb-4 rounded-lg border border-zinc-800 bg-zinc-900/50 overflow-hidden shadow-sm">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center gap-2 p-2.5 text-xs font-medium text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-300 transition-colors"
            >
                {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                <Brain className="w-3.5 h-3.5" />
                <span>Thinking Process</span>
            </button>
            {isOpen && (
                <div className="p-4 text-sm text-zinc-400 font-mono whitespace-pre-wrap border-t border-zinc-800 bg-black/20 animate-in fade-in slide-in-from-top-1 duration-200 leading-relaxed">
                    {content}
                </div>
            )}
        </div>
    );
};
