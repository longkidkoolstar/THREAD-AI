import React, { useState } from 'react';
import { ChevronDown, Box } from 'lucide-react';

interface Props {
    currentModel: string;
    onSelect: (model: string) => void;
}

export const ModelSelector: React.FC<Props> = ({ currentModel, onSelect }) => {
    return (
        <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition duration-200"></div>
            <div className="relative flex items-center bg-zinc-900 rounded-lg border border-zinc-800 hover:border-zinc-700 transition-colors">
                <div className="pl-3 text-zinc-500">
                    <Box className="w-4 h-4" />
                </div>
                <select 
                    value={currentModel}
                    onChange={(e) => onSelect(e.target.value)}
                    className="appearance-none bg-transparent text-zinc-300 pl-2 pr-10 py-2 rounded-lg focus:outline-none cursor-pointer text-sm font-medium w-full"
                >
                    <option value="deepseek-chat">DeepSeek V3</option>
                    <option value="deepseek-reasoner">DeepSeek R1 (Reasoning)</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
            </div>
        </div>
    );
};
